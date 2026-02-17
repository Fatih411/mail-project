using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MailProject.Domain.Enums;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;
using MailProject.Application.DTOs;
using MailProject.Infrastructure.Persistence;
using AutoMapper;

namespace MailProject.Infrastructure.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly MailDbContext _context;
        private readonly IMapper _mapper;

        public DashboardService(MailDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<CommonResponseMessage<DashboardStatsDto>> GetUserStatsAsync(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.Package)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return CommonResponseMessage<DashboardStatsDto>.Fail("User not found", 404);

            var today = DateTime.UtcNow.Date;
            var nextDay = today.AddDays(1);

            // Mail Logs for this user
            var logsQuery = _context.MailLogs.Where(l => l.UserId == userId);
            
            var totalSent = await logsQuery.CountAsync();
            var successCount = await logsQuery.CountAsync(l => l.Status == "Success");
            var failCount = await logsQuery.CountAsync(l => l.Status == "Fail" || l.Status == "Failed");

            // Daily Usage
            var dailySent = await logsQuery.CountAsync(l => l.SentAt >= today && l.SentAt < nextDay);
            var dailyLimit = user.Package.DailyMailLimit;
            var remaining = dailyLimit - dailySent;
            if (remaining < 0) remaining = 0;

            // Recent Activity (Last 5 mails)
            // Recent Activity (Last 5 mails)
            var recentLogs = await logsQuery
                .Include(l => l.MailTemplate)
                .OrderByDescending(l => l.SentAt)
                .Take(5)
                .ToListAsync();

            var recentLogsDto = recentLogs.Select(l => new MailLogDto
            {
                Id = l.Id,
                SenderEmail = l.SenderEmail,
                RecipientEmail = l.RecipientEmail,
                Subject = l.MailTemplate != null ? l.MailTemplate.Title : "(Şablon Yok)",
                Status = l.Status,
                ErrorMessage = l.ErrorMessage,
                UserId = l.UserId,
                SentAt = l.SentAt
            }).ToList();

            var stats = new DashboardStatsDto
            {
                TotalEmailsSent = totalSent,
                SuccessfulEmails = successCount,
                FailedEmails = failCount,
                TotalDailyLimit = dailyLimit,
                RemainingDailyLimit = remaining,
                PackageName = user.Package.Name,
                PackageEndDate = user.PackageEndDate,
                RecentActivity = recentLogsDto
            };

            // Admin Logic
            if (user.Role == UserRole.Admin)
            {
                stats.TotalUsers = await _context.Users.CountAsync();
                stats.SystemTotalEmails = await _context.MailLogs.CountAsync();
                stats.SystemTotalFailed = await _context.MailLogs.CountAsync(l => l.Status == "Fail" || l.Status == "Failed");
            }

            return CommonResponseMessage<DashboardStatsDto>.Success(stats);
        }
    }
}
