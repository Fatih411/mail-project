using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using MailProject.Application.Common.Models;
using MailProject.Application.DTOs;

namespace MailProject.Application.Common.Interfaces
{
    public interface IContactService
    {
        Task<CommonResponseMessage<List<ContactDto>>> GetContactsAsync(Guid userId);
        Task<CommonResponseMessage<List<ContactListDto>>> GetContactListsAsync(Guid userId);
        Task<CommonResponseMessage<ContactListDto>> CreateContactListAsync(Guid userId, string name, string? description);
        Task<CommonResponseMessage<bool>> DeleteContactListAsync(Guid userId, Guid listId, bool keepContacts = true);
        Task<CommonResponseMessage<int>> ImportContactsAsync(Guid userId, Stream fileStream, string fileName, Guid? listId = null);
        Task<CommonResponseMessage<bool>> UnsubscribeContactAsync(string trackingId);
        Task<CommonResponseMessage<bool>> AddContactToListAsync(Guid userId, string email, Guid listId);
        Task<CommonResponseMessage<int>> BatchAddContactsAsync(Guid userId, List<string> emails, Guid? listId = null);
        Task<CommonResponseMessage<bool>> DeleteContactAsync(Guid userId, Guid contactId);
        Task<CommonResponseMessage<ContactDto>> UpdateContactAsync(Guid userId, ContactDto contactDto);
    }
}
