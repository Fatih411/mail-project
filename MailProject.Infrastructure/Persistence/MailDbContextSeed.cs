using Microsoft.EntityFrameworkCore;
using MailProject.Domain.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MailProject.Infrastructure.Persistence
{
    public static class MailDbContextSeed
    {
        public static async Task SeedAsync(MailDbContext context)
        {
            if (context.Database.IsNpgsql())
            {
                await context.Database.MigrateAsync();
            }

            if (!context.Packages.Any())
            {
                context.Packages.AddRange(
                    new Package { Id = Guid.NewGuid(), Name = "Başlangıç", DailyMailLimit = 100, SmtpAccountLimit = 1, MaxAttachmentSizeMB = 10, Price = 0, CreatedAt = DateTime.UtcNow, IsDeleted = false },
                    new Package { Id = Guid.NewGuid(), Name = "Profesyonel", DailyMailLimit = 5000, SmtpAccountLimit = 5, MaxAttachmentSizeMB = 25, Price = 200, CreatedAt = DateTime.UtcNow, IsDeleted = false },
                    new Package { Id = Guid.NewGuid(), Name = "Kurumsal", DailyMailLimit = 50000, SmtpAccountLimit = 100, MaxAttachmentSizeMB = 50, Price = 1000, CreatedAt = DateTime.UtcNow, IsDeleted = false }
                );
                await context.SaveChangesAsync();
            }

            if (!context.Users.Any(u => u.Email == "admin@mailproject.com"))
            {
                var package = await context.Packages.FirstOrDefaultAsync(p => p.Name == "Kurumsal");
                if (package != null)
                {
                    var user = new User
                    {
                        Id = Guid.NewGuid(),
                        FullName = "System Admin",
                        Email = "admin@mailproject.com",
                        PasswordHash = "Admin123!", // TODO: Hash properly
                        PackageId = package.Id,
                        PackageStartDate = DateTime.UtcNow,
                        PackageEndDate = DateTime.UtcNow.AddYears(10),
                        IsVerified = true,
                        IsDeleted = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users.Add(user);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
