using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MailProject.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace MailProject.WebAPI.Filters
{
    public class QuotaCheckFilter : IAsyncActionFilter
    {
        private readonly MailDbContext _context;

        public QuotaCheckFilter(MailDbContext context)
        {
            _context = context;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // 1. Get User Email/Id from Claims
            var userEmail = context.HttpContext.User.FindFirst(ClaimTypes.Email)?.Value;
            
            if (string.IsNullOrEmpty(userEmail))
            {
                // If not authenticated or no email claim, let Auth middleware handle it or proceed (likely unauthorized)
                // But if this filter is applied globally or on specific endpoints, we assume user is logged in.
                await next();
                return;
            }

            // 2. Get User & Package
            var user = await _context.Users
                .Include(u => u.Package)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == userEmail && !u.IsDeleted);

            if (user == null)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // 3. Check Package Expiry
            if (user.IsPackageExpired)
            {
                context.Result = new ObjectResult(new { Message = "Package expired." }) { StatusCode = 403 };
                return;
            }

            // 4. Check Daily Limit
            var today = DateTime.UtcNow.Date;
            var dailyCount = await _context.MailLogs
                .CountAsync(l => l.SenderEmail == userEmail && l.SentAt >= today);

            if (dailyCount >= user.Package.DailyMailLimit)
            {
                context.Result = new ObjectResult(new { Message = "Daily quota exceeded." }) { StatusCode = 429 };
                return;
            }

            await next();
        }
    }
}
