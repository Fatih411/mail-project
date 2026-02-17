using System.Threading.Tasks;
using MailProject.Application.Common.Models;
using MailProject.Domain.Entities;

namespace MailProject.Application.Common.Interfaces
{
    public interface IMailService
    {
        Task<CommonResponseMessage<bool>> SendEmailAsync(SmtpAccount smtpAccount, string to, string subject, string htmlBody, string? cc = null, string? bcc = null, List<EmailAttachment>? attachments = null, Guid? userId = null, Guid? jobId = null, Guid? templateId = null, Guid? existingLogId = null, string? trackingId = null);
    }
}
