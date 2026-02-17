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
    public class UserService : IUserService
    {
        private readonly MailDbContext _context;

        public UserService(MailDbContext context)
        {
            _context = context;
        }

        public async Task<CommonResponseMessage<List<UserDto>>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Include(u => u.Package)
                .OrderByDescending(u => u.CreatedAt) // Assuming BaseEntity has CreatedAt
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    PackageName = u.Package != null ? u.Package.Name : "Paket Yok",
                    PackageEndDate = u.PackageEndDate,
                    IsVerified = u.IsVerified
                })
                .ToListAsync();

            return CommonResponseMessage<List<UserDto>>.Success(users);
        }

        public async Task<CommonResponseMessage<bool>> UpdateUserPackageAsync(Guid userId, Guid packageId, DateTime? packageEndDate = null)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return CommonResponseMessage<bool>.Fail("Kullanıcı bulunamadı", 404);

            var package = await _context.Packages.FindAsync(packageId);
            if (package == null) return CommonResponseMessage<bool>.Fail("Paket bulunamadı", 404);

            user.PackageId = packageId;
            user.PackageStartDate = DateTime.UtcNow;
            
            if (packageEndDate.HasValue)
            {
                // Ensure the date is in UTC, if it's Unspecified, treat as Local then convert, or assume UTC.
                // Best practice: Frontend sends ISO string, binding parses it.
                // If it's pure Date (yyyy-MM-dd), it might be midnight.
                user.PackageEndDate = packageEndDate.Value.Kind == DateTimeKind.Utc ? packageEndDate.Value : packageEndDate.Value.ToUniversalTime();
            }
            else
            {
                user.PackageEndDate = DateTime.UtcNow.AddMonths(1);
            }

            await _context.SaveChangesAsync();

            return CommonResponseMessage<bool>.Success(true, "Kullanıcı paketi güncellendi.");
        }
    }
}
