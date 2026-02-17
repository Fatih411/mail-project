using System;

namespace MailProject.Application.DTOs
{
    public class PackageDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DailyMailLimit { get; set; }
        public int SmtpAccountLimit { get; set; }
        public int MaxAttachmentSizeMB { get; set; }
        public bool IsActive { get; set; }
        public decimal Price { get; set; }
    }

    public class SmtpAccountDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // Should be handled carefully, maybe separate UpdateDto
        public bool EnableSsl { get; set; }
        public bool IsDefault { get; set; }
    }

    public class MailTemplateDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string HtmlContent { get; set; } = string.Empty;
        public string? CcList { get; set; }
        public string? BccList { get; set; }
    }

    public class MailLogDto
    {
        public Guid Id { get; set; }
        public string SenderEmail { get; set; } = string.Empty;
        public string RecipientEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
        public Guid? UserId { get; set; }
        public DateTime SentAt { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalEmailsSent { get; set; }
        public int SuccessfulEmails { get; set; }
        public int FailedEmails { get; set; }
        public int RemainingDailyLimit { get; set; }
        public int TotalDailyLimit { get; set; }
        public string PackageName { get; set; } = string.Empty;
        public DateTime PackageEndDate { get; set; }
        
        // Admin Specific
        public int? TotalUsers { get; set; }
        public int? SystemTotalEmails { get; set; }
        public int? SystemTotalFailed { get; set; }

        public List<MailLogDto> RecentActivity { get; set; } = new List<MailLogDto>();
    }
    public class UserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string PackageName { get; set; } = string.Empty;
        public DateTime PackageEndDate { get; set; }
        public bool IsVerified { get; set; }
    }

    public class ContactDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsUnsubscribed { get; set; }
        public DateTime? UnsubscribedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ContactListDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ContactDto> Contacts { get; set; } = new List<ContactDto>();
    }
}
