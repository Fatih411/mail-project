using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;
using MailProject.Infrastructure.Persistence;

namespace MailProject.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly MailDbContext _context;

        public FileService(IWebHostEnvironment webHostEnvironment, MailDbContext context)
        {
            _webHostEnvironment = webHostEnvironment;
            _context = context;
        }

        public async Task<CommonResponseMessage<string>> UploadFileAsync(Stream fileStream, string fileName, string contentType, long length, string folder, Guid userId)
        {
            try
            {
                if (fileStream == null || length == 0)
                    return CommonResponseMessage<string>.Fail("Dosya geçersiz.");

                // Check package limit
                var user = await _context.Users
                    .Include(u => u.Package)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return CommonResponseMessage<string>.Fail("Kullanıcı bulunamadı.");

                long maxSizeBytes = user.Package.MaxAttachmentSizeMB * 1024L * 1024L;
                if (length > maxSizeBytes)
                    return CommonResponseMessage<string>.Fail($"Dosya boyutu çok büyük. Maksimum limit: {user.Package.MaxAttachmentSizeMB} MB");

                string webRootPath = _webHostEnvironment.WebRootPath;
                if (string.IsNullOrEmpty(webRootPath))
                {
                    webRootPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");
                }

                // Subfolder by userId
                string userFolder = Path.Combine(webRootPath, "uploads", folder, userId.ToString());
                if (!Directory.Exists(userFolder))
                    Directory.CreateDirectory(userFolder);

                string safeFileName = Guid.NewGuid().ToString() + Path.GetExtension(fileName);
                string filePath = Path.Combine(userFolder, safeFileName);

                using (var targetStream = new FileStream(filePath, FileMode.Create))
                {
                    await fileStream.CopyToAsync(targetStream);
                }

                string relativePath = $"/uploads/{folder}/{userId}/{safeFileName}";
                return CommonResponseMessage<string>.Success(relativePath, "Dosya başarıyla yüklendi.");
            }
            catch (Exception ex)
            {
                return CommonResponseMessage<string>.Fail($"Hata oluştu: {ex.Message}");
            }
        }

        public async Task<System.Collections.Generic.List<string>> GetUserFilesAsync(Guid userId, string folder)
        {
            var files = new System.Collections.Generic.List<string>();
            try
            {
                string webRootPath = _webHostEnvironment.WebRootPath;
                if (string.IsNullOrEmpty(webRootPath))
                {
                    webRootPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");
                }

                string userFolder = Path.Combine(webRootPath, "uploads", folder, userId.ToString());
                if (Directory.Exists(userFolder))
                {
                    var fileEntries = Directory.GetFiles(userFolder);
                    foreach (var filePath in fileEntries)
                    {
                        string fileName = Path.GetFileName(filePath);
                        files.Add($"/uploads/{folder}/{userId}/{fileName}");
                    }
                }
            }
            catch { }
            return await Task.FromResult(files);
        }

        public bool DeleteFile(string filePath)
        {
            try
            {
                string webRootPath = _webHostEnvironment.WebRootPath;
                if (string.IsNullOrEmpty(webRootPath))
                {
                    webRootPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot");
                }

                string fullPath = Path.Combine(webRootPath, filePath.TrimStart('/'));
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }
    }
}
