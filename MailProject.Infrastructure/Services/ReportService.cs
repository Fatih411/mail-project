using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;
using MailProject.Application.DTOs;
using MailProject.Infrastructure.Persistence;

namespace MailProject.Infrastructure.Services
{
    public class ReportService : IReportService
    {
        private readonly MailDbContext _context;

        public ReportService(MailDbContext context)
        {
            _context = context;
        }

        public async Task<CommonResponseMessage<ReportResultDto>> GetReportsAsync(Guid userId, ReportFilterDto filter)
        {
            var query = _context.MailLogs
                .AsNoTracking()
                .Where(l => l.UserId == userId)
                .Include(l => l.MailTemplate)
                .AsQueryable();

            // Filters
            if (filter.StartDate.HasValue)
                query = query.Where(l => l.SentAt >= filter.StartDate.Value); // Start of day ideally handled by client or here

            if (filter.EndDate.HasValue)
            {
                var endDate = filter.EndDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(l => l.SentAt <= endDate);
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                if (filter.Status.ToLower() == "success")
                    query = query.Where(l => l.Status == "Success");
                else if (filter.Status.ToLower() == "fail")
                    query = query.Where(l => l.Status == "Fail");
                else if (filter.Status.ToLower() == "pending")
                    query = query.Where(l => l.Status == "Pending");
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var term = filter.SearchTerm.ToLower();
                query = query.Where(l => 
                    l.RecipientEmail.ToLower().Contains(term) || 
                    (l.MailTemplate != null && l.MailTemplate.Subject.ToLower().Contains(term))
                );
            }

            // Ordering
            query = query.OrderByDescending(l => l.SentAt);

            // Pagination
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(l => new ReportItemDto
                {
                    Id = l.Id,
                    Date = l.SentAt,
                    Recipient = l.RecipientEmail,
                    Subject = l.MailTemplate != null ? l.MailTemplate.Subject : "(Konu Yok)",
                    Status = l.Status,
                    ErrorMessage = l.ErrorMessage,
                    OpenedAt = l.OpenedAt,
                    ClickedAt = l.ClickedAt,
                    IsBounced = l.IsBounced,
                    BounceReason = l.BounceReason
                })
                .ToListAsync();

            // Calculate Index relative to total (e.g., 10000 decr) or just page index?
            // User requested "Sıra No". Usually 1..N on page or global. Global is better.
            // If descending, 1 is the latest? Or 1 is oldest? Usually Latest is #1 in UI list if strictly ordered.
            // Let's do simple row number based on OrderBy.
            // Actually verifying exact "Row Number" in massive pagination needs Window Function or client calculation.
            // Client side calculation: (Page - 1) * Size + Index + 1.
            // I'll set it here or let UI do it. Let's let UI do it based on total count logic if needed, 
            // but for simplicity I'll just map it to 0 here and let UI showing logic handle "Row #".
            // Actually, if I want global descending index (Total -> 1), it's Total - ((Page-1)*Size + Index).
            
            for (int i = 0; i < items.Count; i++)
            {
               items[i].Index = (filter.PageNumber - 1) * filter.PageSize + i + 1;
            }

            var result = new ReportResultDto
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };

            return CommonResponseMessage<ReportResultDto>.Success(result);
        }
    }
}
