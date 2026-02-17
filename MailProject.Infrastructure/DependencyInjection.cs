using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Repositories;
using MailProject.Infrastructure.Persistence;
using MailProject.Infrastructure.Repositories;
using MailProject.Infrastructure.Services;
using Hangfire;
using Hangfire.PostgreSql;

namespace MailProject.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<MailDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(MailDbContext).Assembly.FullName)));

            services.AddSingleton<IEncryptionService, AesEncryptionService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPackageService, PackageService>();
            services.AddScoped<ISmtpAccountService, SmtpAccountService>();
            services.AddScoped<IMailTemplateService, MailTemplateService>();
            services.AddScoped<IMailLogService, MailLogService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IMailDispatchService, MailDispatchService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IContactService, ContactService>();



            services.AddTransient<IMailService, MailKitService>();
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            // Hangfire (using PostgreSQL storage)
            services.AddHangfire(config => config
                .SetDataCompatibilityLevel(Hangfire.CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(options => options.UseNpgsqlConnection(configuration.GetConnectionString("DefaultConnection"))));

            services.AddHangfireServer();

            // Redis Cache
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = configuration.GetConnectionString("Redis") ?? "localhost:6379";
            });

            return services;
        }
    }
}
