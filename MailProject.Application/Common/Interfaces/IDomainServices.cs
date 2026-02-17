using System.Threading.Tasks;
using System.Collections.Generic;
using MailProject.Application.Common.Models;
using MailProject.Application.Common.Services;
using MailProject.Application.DTOs;
using MailProject.Domain.Entities;

namespace MailProject.Application.Common.Interfaces
{
    public interface IPackageService : IService<Package, PackageDto> 
    {
        Task<CommonResponseMessage<IEnumerable<PackageDto>>> GetActivePackagesAsync();
    }
    public interface ISmtpAccountService : IService<SmtpAccount, SmtpAccountDto>
    {
        Task<CommonResponseMessage<IEnumerable<SmtpAccountDto>>> GetAllByUserIdAsync(Guid userId);
    }
    public interface IMailTemplateService : IService<MailTemplate, MailTemplateDto>
    {
        Task<CommonResponseMessage<IEnumerable<MailTemplateDto>>> GetAllByUserIdAsync(Guid userId);
    }
    public interface IMailLogService : IService<MailLog, MailLogDto> 
    {
        Task<CommonResponseMessage<IEnumerable<MailLogDto>>> GetLogsByJobIdAsync(Guid jobId);
    }
}
