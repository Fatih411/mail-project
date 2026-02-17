using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CsvHelper;
using CsvHelper.Configuration;
using ClosedXML.Excel;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;
using MailProject.Domain.Entities;
using MailProject.Application.DTOs;
using MailProject.Infrastructure.Persistence;
using System.Globalization;

namespace MailProject.Infrastructure.Services
{
    public class ContactService : IContactService
    {
        private readonly MailDbContext _context;

        public ContactService(MailDbContext context)
        {
            _context = context;
        }

        public async Task<CommonResponseMessage<List<ContactDto>>> GetContactsAsync(Guid userId)
        {
            var contacts = await _context.Contacts
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new ContactDto
                {
                    Id = c.Id,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    Email = c.Email,
                    IsUnsubscribed = c.IsUnsubscribed,
                    UnsubscribedAt = c.UnsubscribedAt,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
            return CommonResponseMessage<List<ContactDto>>.Success(contacts);
        }

        public async Task<CommonResponseMessage<List<ContactListDto>>> GetContactListsAsync(Guid userId)
        {
            var lists = await _context.ContactLists
                .Include(cl => cl.Contacts)
                .Where(cl => cl.UserId == userId)
                .OrderByDescending(cl => cl.CreatedAt)
                .Select(cl => new ContactListDto
                {
                    Id = cl.Id,
                    Name = cl.Name,
                    Description = cl.Description,
                    CreatedAt = cl.CreatedAt,
                    Contacts = cl.Contacts.Select(c => new ContactDto
                    {
                        Id = c.Id,
                        FirstName = c.FirstName,
                        LastName = c.LastName,
                        Email = c.Email,
                        IsUnsubscribed = c.IsUnsubscribed,
                        UnsubscribedAt = c.UnsubscribedAt,
                        CreatedAt = c.CreatedAt
                    }).ToList()
                })
                .ToListAsync();
            return CommonResponseMessage<List<ContactListDto>>.Success(lists);
        }

        public async Task<CommonResponseMessage<ContactListDto>> CreateContactListAsync(Guid userId, string name, string? description)
        {
            var list = new ContactList
            {
                UserId = userId,
                Name = name,
                Description = description
            };
            _context.ContactLists.Add(list);
            await _context.SaveChangesAsync();

            var dto = new ContactListDto
            {
                Id = list.Id,
                Name = list.Name,
                Description = list.Description,
                CreatedAt = list.CreatedAt,
                Contacts = new List<ContactDto>()
            };

            return CommonResponseMessage<ContactListDto>.Success(dto, "Liste başarıyla oluşturuldu.");
        }

        public async Task<CommonResponseMessage<bool>> DeleteContactListAsync(Guid userId, Guid listId, bool keepContacts = true)
        {
            var list = await _context.ContactLists
                .Include(cl => cl.Contacts)
                .FirstOrDefaultAsync(cl => cl.UserId == userId && cl.Id == listId);
            
            if (list == null) return CommonResponseMessage<bool>.Fail("Liste bulunamadı.");

            if (!keepContacts)
            {
                // Also delete contacts if they are ONLY in this list? 
                // Or just delete all contacts in this list for this user.
                var contactIds = list.Contacts.Select(c => c.Id).ToList();
                var contactsToDelete = await _context.Contacts
                    .Where(c => contactIds.Contains(c.Id))
                    .ToListAsync();
                
                foreach(var c in contactsToDelete)
                {
                    c.IsDeleted = true;
                    c.DeletedAt = DateTime.UtcNow;
                }
            }

            list.IsDeleted = true;
            list.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return CommonResponseMessage<bool>.Success(true, "Liste başarıyla silindi.");
        }

        public async Task<CommonResponseMessage<int>> BatchAddContactsAsync(Guid userId, List<string> emails, Guid? listId = null)
        {
            if (emails == null || !emails.Any())
                return CommonResponseMessage<int>.Fail("Metin alanı boş olamaz.");

            var validEmails = emails
                .Where(e => !string.IsNullOrWhiteSpace(e))
                .Select(e => e.Trim().ToLower())
                .Distinct()
                .ToList();

            if (!validEmails.Any())
                return CommonResponseMessage<int>.Fail("Geçerli e-posta bulunamadı.");

            var existingContacts = await _context.Contacts
                .Where(c => c.UserId == userId && validEmails.Contains(c.Email.ToLower()))
                .ToListAsync();

            var existingEmails = existingContacts.Select(c => c.Email.ToLower()).ToList();
            var newEmails = validEmails.Where(e => !existingEmails.Contains(e)).ToList();

            var newContacts = newEmails.Select(e => new Contact
            {
                UserId = userId,
                Email = e,
                FirstName = "",
                LastName = ""
            }).ToList();

            if (newContacts.Any())
            {
                _context.Contacts.AddRange(newContacts);
                await _context.SaveChangesAsync();
            }

            // Associate with list if provided
            if (listId.HasValue)
            {
                var list = await _context.ContactLists
                    .Include(cl => cl.Contacts)
                    .FirstOrDefaultAsync(cl => cl.UserId == userId && cl.Id == listId.Value);

                if (list != null)
                {
                    // Combine all (new + existing)
                    var allContactsToAssociate = await _context.Contacts
                        .Where(c => c.UserId == userId && validEmails.Contains(c.Email.ToLower()))
                        .ToListAsync();

                    foreach (var c in allContactsToAssociate)
                    {
                        if (!list.Contacts.Any(lc => lc.Id == c.Id))
                            list.Contacts.Add(c);
                    }
                    await _context.SaveChangesAsync();
                }
            }

            return CommonResponseMessage<int>.Success(newContacts.Count, $"{newContacts.Count} yeni kişi eklendi. Toplam {validEmails.Count} kişi işlendi.");
        }

        public async Task<CommonResponseMessage<int>> ImportContactsAsync(Guid userId, Stream fileStream, string fileName, Guid? listId = null)
        {
            try
            {
                var contacts = new List<Contact>();
                var extension = Path.GetExtension(fileName).ToLower();

                if (extension == ".csv")
                {
                    using var reader = new StreamReader(fileStream);
                    using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture) { HasHeaderRecord = true });
                    var records = csv.GetRecords<dynamic>();
                    foreach (var record in records)
                    {
                        var dict = (IDictionary<string, object>)record;
                        contacts.Add(MapToContact(dict, userId));
                    }
                }
                else if (extension == ".xlsx" || extension == ".xls")
                {
                    using var workbook = new XLWorkbook(fileStream);
                    var worksheet = workbook.Worksheet(1);
                    var rows = worksheet.RowsUsed().Skip(1); // Skip header
                    var headerRow = worksheet.Row(1);
                    var colMap = new Dictionary<string, int>();
                    for (int i = 1; i <= headerRow.LastCellUsed().Address.ColumnNumber; i++)
                    {
                        colMap[headerRow.Cell(i).GetString().Trim().ToLower()] = i;
                    }

                    foreach (var row in rows)
                    {
                        var contact = new Contact { UserId = userId };
                        if (colMap.TryGetValue("email", out int emailCol)) contact.Email = row.Cell(emailCol).GetString();
                        if (colMap.TryGetValue("firstname", out int fCol)) contact.FirstName = row.Cell(fCol).GetString();
                        else if (colMap.TryGetValue("ad", out int adCol)) contact.FirstName = row.Cell(adCol).GetString();
                        
                        if (colMap.TryGetValue("lastname", out int lCol)) contact.LastName = row.Cell(lCol).GetString();
                        else if (colMap.TryGetValue("soyad", out int sayadCol)) contact.LastName = row.Cell(sayadCol).GetString();

                        if (!string.IsNullOrEmpty(contact.Email))
                            contacts.Add(contact);
                    }
                }
                else
                {
                    return CommonResponseMessage<int>.Fail("Desteklenmeyen dosya formatı.");
                }

                if (contacts.Count == 0) return CommonResponseMessage<int>.Fail("Aktarılacak geçerli kişi bulunamadı.");

                // Check for existing contacts to avoid duplicates for this user
                var existingEmails = await _context.Contacts
                    .Where(c => c.UserId == userId)
                    .Select(c => c.Email.ToLower())
                    .ToListAsync();

                var newContacts = contacts
                    .Where(c => !existingEmails.Contains(c.Email.ToLower()))
                    .GroupBy(c => c.Email.ToLower())
                    .Select(g => g.First())
                    .ToList();

                _context.Contacts.AddRange(newContacts);
                await _context.SaveChangesAsync();

                // If listId provided, associate ALL contacts (new and old) with the list
                if (listId.HasValue)
                {
                    var list = await _context.ContactLists
                        .Include(cl => cl.Contacts)
                        .FirstOrDefaultAsync(cl => cl.Id == listId.Value && cl.UserId == userId);

                    if (list != null)
                    {
                        var allUserContacts = await _context.Contacts
                            .Where(c => c.UserId == userId)
                            .ToListAsync();
                        
                        var importedEmails = contacts.Select(c => c.Email.ToLower()).ToList();
                        var contactsToAddToList = allUserContacts
                            .Where(c => importedEmails.Contains(c.Email.ToLower()))
                            .ToList();

                        foreach (var c in contactsToAddToList)
                        {
                            if (!list.Contacts.Any(lc => lc.Id == c.Id))
                                list.Contacts.Add(c);
                        }
                        await _context.SaveChangesAsync();
                    }
                }

                return CommonResponseMessage<int>.Success(newContacts.Count, $"{newContacts.Count} yeni kişi başarıyla aktarıldı.");
            }
            catch (Exception ex)
            {
                return CommonResponseMessage<int>.Fail($"Aktarım sırasında hata: {ex.Message}");
            }
        }

        public async Task<CommonResponseMessage<bool>> UnsubscribeContactAsync(string trackingId)
        {
            var log = await _context.MailLogs
                .FirstOrDefaultAsync(l => l.TrackingId == trackingId);
            
            if (log == null) return CommonResponseMessage<bool>.Fail("Geçersiz işlem.");

            var contact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.UserId == log.UserId && c.Email == log.RecipientEmail);

            if (contact != null)
            {
                contact.IsUnsubscribed = true;
                contact.UnsubscribedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return CommonResponseMessage<bool>.Success(true, "Abonelikten başarıyla ayrıldınız.");
            }

            return CommonResponseMessage<bool>.Fail("Kişi bulunamadı.");
        }

        public async Task<CommonResponseMessage<bool>> AddContactToListAsync(Guid userId, string email, Guid listId)
        {
            var list = await _context.ContactLists
                .Include(cl => cl.Contacts)
                .FirstOrDefaultAsync(cl => cl.Id == listId && cl.UserId == userId);

            if (list == null) return CommonResponseMessage<bool>.Fail("Liste bulunamadı.");

            var contact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Email.ToLower() == email.ToLower());

            if (contact == null)
            {
                contact = new Contact { UserId = userId, Email = email };
                _context.Contacts.Add(contact);
                await _context.SaveChangesAsync();
            }

            if (!list.Contacts.Any(c => c.Id == contact.Id))
            {
                list.Contacts.Add(contact);
                await _context.SaveChangesAsync();
            }

            return CommonResponseMessage<bool>.Success(true, "Kişi listeye eklendi.");
        }

        public async Task<CommonResponseMessage<bool>> DeleteContactAsync(Guid userId, Guid contactId)
        {
            var contact = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == contactId && c.UserId == userId);
            if (contact == null) return CommonResponseMessage<bool>.Fail("Kişi bulunamadı.");

            contact.IsDeleted = true;
            contact.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return CommonResponseMessage<bool>.Success(true, "Kişi başarıyla silindi.");
        }

        public async Task<CommonResponseMessage<ContactDto>> UpdateContactAsync(Guid userId, ContactDto contactDto)
        {
            var contact = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == contactDto.Id && c.UserId == userId);
            if (contact == null) return CommonResponseMessage<ContactDto>.Fail("Kişi bulunamadı.");

            contact.FirstName = contactDto.FirstName;
            contact.LastName = contactDto.LastName;
            contact.Email = contactDto.Email;
            
            await _context.SaveChangesAsync();

            return CommonResponseMessage<ContactDto>.Success(new ContactDto
            {
                Id = contact.Id,
                FirstName = contact.FirstName,
                LastName = contact.LastName,
                Email = contact.Email,
                IsUnsubscribed = contact.IsUnsubscribed,
                UnsubscribedAt = contact.UnsubscribedAt,
                CreatedAt = contact.CreatedAt
            }, "Kişi bilgileri güncellendi.");
        }

        private Contact MapToContact(IDictionary<string, object> dict, Guid userId)
        {
            var contact = new Contact { UserId = userId };
            foreach (var key in dict.Keys)
            {
                var lowerKey = key.ToLower();
                var val = dict[key]?.ToString();
                if (string.IsNullOrEmpty(val)) continue;

                if (lowerKey == "email" || lowerKey == "e-posta") contact.Email = val;
                else if (lowerKey == "firstname" || lowerKey == "ad" || lowerKey == "name") contact.FirstName = val;
                else if (lowerKey == "lastname" || lowerKey == "soyad" || lowerKey == "surname") contact.LastName = val;
            }
            return contact;
        }
    }
}
