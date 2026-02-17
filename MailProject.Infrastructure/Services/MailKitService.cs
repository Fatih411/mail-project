using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;
using MailProject.Domain.Entities;

using MailProject.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using HtmlAgilityPack;
using System.Linq;
using System.Web;

namespace MailProject.Infrastructure.Services
{
    public class MailKitService : IMailService
    {
        private readonly IEncryptionService _encryptionService;
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;
        private readonly Microsoft.Extensions.Logging.ILogger<MailKitService> _logger;

        public MailKitService(
            IEncryptionService encryptionService, 
            IServiceProvider serviceProvider, 
            IConfiguration configuration,
            Microsoft.Extensions.Logging.ILogger<MailKitService> logger)
        {
            _encryptionService = encryptionService;
            _serviceProvider = serviceProvider;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<CommonResponseMessage<bool>> SendEmailAsync(SmtpAccount smtpAccount, string to, string subject, string htmlBody, string? cc = null, string? bcc = null, List<EmailAttachment>? attachments = null, Guid? userId = null, Guid? jobId = null, Guid? templateId = null, Guid? existingLogId = null, string? trackingId = null)
        {
            // ... (keep logic same but ensure we use _logRepository or context correctly)
            MailLog? log = null;

            if (existingLogId == null)
            {
                log = new MailLog
                {
                    SenderEmail = smtpAccount.Username,
                    RecipientEmail = to,
                    SentAt = DateTime.UtcNow,
                    UserId = userId,
                    JobId = jobId,
                    MailTemplateId = templateId
                };
            }

            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(smtpAccount.AccountName, smtpAccount.Username));
                message.To.Add(MailboxAddress.Parse(to));
                message.Subject = subject;

                // Process Tracking
                string processedHtml = htmlBody;
                if (!string.IsNullOrEmpty(trackingId))
                {
                    processedHtml = ProcessTracking(htmlBody, trackingId);
                }

                var bodyBuilder = new BodyBuilder { HtmlBody = processedHtml };

                if (attachments != null && attachments.Any())
                {
                    foreach (var attachment in attachments)
                    {
                        bodyBuilder.Attachments.Add(attachment.FileName, attachment.Content, ContentType.Parse(attachment.ContentType));
                    }
                }

                message.Body = bodyBuilder.ToMessageBody();

                if (!string.IsNullOrEmpty(cc))
                {
                   foreach(var ccEmail in cc.Split(','))
                       message.Cc.Add(MailboxAddress.Parse(ccEmail.Trim()));
                }

                if (!string.IsNullOrEmpty(bcc))
                {
                   foreach(var bccEmail in bcc.Split(','))
                       message.Bcc.Add(MailboxAddress.Parse(bccEmail.Trim()));
                }

                using var client = new SmtpClient();
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                await client.ConnectAsync(smtpAccount.Host, smtpAccount.Port, smtpAccount.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);

                string password = smtpAccount.Password;
                try 
                {
                    password = _encryptionService.Decrypt(smtpAccount.Password);
                }
                catch 
                {
                    password = smtpAccount.Password;
                }
                await client.AuthenticateAsync(smtpAccount.Username, password);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                await UpdateOrSaveLogAsync(existingLogId, log, "Success", null);

                return CommonResponseMessage<bool>.Success(true, "Email sent successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Recipient}", to);
                await UpdateOrSaveLogAsync(existingLogId, log, "Failed", ex.Message);

                return CommonResponseMessage<bool>.Fail($"Failed to send email: {ex.Message}", 500);
            }
        }

        private string ProcessTracking(string html, string trackingId)
        {
            try
            {
                _logger.LogInformation("Processing tracking for TrackingId: {TrackingId}", trackingId);
                var baseUrl = _configuration["App:BaseUrl"]?.TrimEnd('/');
                if (string.IsNullOrEmpty(baseUrl)) 
                {
                    _logger.LogWarning("Tracking disabled because App:BaseUrl is missing in configuration.");
                    return html;
                }

                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                // 1. Link Wrapping
                var anchors = doc.DocumentNode.SelectNodes("//a[@href]");
                int wrappedCount = 0;
                if (anchors != null)
                {
                    foreach (var a in anchors)
                    {
                        var originalUrl = a.GetAttributeValue("href", "");
                        if (string.IsNullOrEmpty(originalUrl) || originalUrl.StartsWith("#") || originalUrl.StartsWith("mailto:") || originalUrl.Contains("unsubscribe")) continue;

                        var trackingUrl = $"{baseUrl}/api/tracking/click/{trackingId}?url={HttpUtility.UrlEncode(originalUrl)}";
                        a.SetAttributeValue("href", trackingUrl);
                        wrappedCount++;
                    }
                }
                _logger.LogInformation("Wrapped {Count} links for TrackingId: {TrackingId}", wrappedCount, trackingId);

                // 2. Tracking Pixel & Unsubscribe
                var body = doc.DocumentNode.SelectSingleNode("//body") ?? doc.DocumentNode;
                
                // Pixel
                var pixelNode = HtmlNode.CreateNode($"<img src=\"{baseUrl}/api/tracking/open/{trackingId}\" width=\"1\" height=\"1\" style=\"display:none !important; visibility:hidden !important; border:0;\" />");
                body.AppendChild(pixelNode);

                // Unsubscribe Link
                var unsubscribeHtml = $@"
                    <div style=""text-align:center; padding:40px 20px; font-size:12px; color:#94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"">
                        <p style=""margin:0 0 10px 0;"">Bu e-postayı aldınız çünkü listemize üyesiniz.</p>
                        <a href=""{baseUrl}/api/tracking/unsubscribe/{trackingId}"" style=""color:#4f46e5; text-decoration:underline; font-weight:bold;"">Abonelikten Ayrıl</a>
                    </div>";
                var unsubscribeNode = HtmlNode.CreateNode(unsubscribeHtml);
                body.AppendChild(unsubscribeNode);

                _logger.LogInformation("Successfully injected tracking elements for TrackingId: {TrackingId}", trackingId);
                return doc.DocumentNode.OuterHtml;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing tracking for trackingId: {TrackingId}", trackingId);
                return html;
            }
        }

        private async Task UpdateOrSaveLogAsync(Guid? existingLogId, MailLog? newLog, string status, string? errorMessage)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<MailDbContext>();

                if (existingLogId.HasValue)
                {
                    var existingLog = await context.MailLogs.FindAsync(existingLogId.Value);
                    if (existingLog != null)
                    {
                        existingLog.Status = status;
                        existingLog.ErrorMessage = errorMessage;
                        existingLog.SentAt = DateTime.UtcNow; // Update SentAt to actual sent time
                        context.MailLogs.Update(existingLog);
                    }
                }
                else if (newLog != null)
                {
                    newLog.Status = status;
                    newLog.ErrorMessage = errorMessage;
                    context.MailLogs.Add(newLog);
                }
                
                await context.SaveChangesAsync();
            }
            catch
            {
                Console.WriteLine("Failed to save/update mail log");
            }
        }
    }
}
