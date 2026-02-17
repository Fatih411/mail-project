using System;
using System.IO;
using System.Threading.Tasks;
using MailProject.Application.Common.Models;

namespace MailProject.Application.Common.Interfaces
{
    public interface IFileService
    {
        Task<CommonResponseMessage<string>> UploadFileAsync(Stream fileStream, string fileName, string contentType, long length, string folder, Guid userId);
        Task<System.Collections.Generic.List<string>> GetUserFilesAsync(Guid userId, string folder);
        bool DeleteFile(string filePath);
    }
}
