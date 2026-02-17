using System;
using System.Threading.Tasks;
using MailProject.Application.DTOs;
using MailProject.Application.Common.Models;

namespace MailProject.Application.Common.Interfaces
{
    public interface IMailDispatchService
    {
        Task<CommonResponseMessage<Guid>> DispatchBatchAsync(Guid userId, SendMailRequestDto request);
    }
}
