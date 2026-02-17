using System;
using System.Threading.Tasks;
using MailProject.Application.Common.Models;
using MailProject.Application.DTOs;

namespace MailProject.Application.Common.Interfaces
{
    public interface IReportService
    {
        Task<CommonResponseMessage<ReportResultDto>> GetReportsAsync(Guid userId, ReportFilterDto filter);
    }
}
