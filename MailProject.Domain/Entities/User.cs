using System;
using System.Collections.Generic;
using MailProject.Domain.Common;
using MailProject.Domain.Enums;

namespace MailProject.Domain.Entities
{
    public class User : BaseEntity
    {
        public Guid PackageId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public Guid ApiKey { get; set; } = Guid.NewGuid();
        
        // Package Validity
        public DateTime PackageStartDate { get; set; } = DateTime.UtcNow;
        public DateTime PackageEndDate { get; set; }

        public bool IsPackageExpired => DateTime.UtcNow > PackageEndDate;

        // Auth & Verification
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
        public string? VerificationCode { get; set; }
        public bool IsVerified { get; set; }
        public UserRole Role { get; set; } = UserRole.User;

        // Navigation properties
        public Package Package { get; set; } = null!;
        public ICollection<MailTemplate> MailTemplates { get; set; } = new List<MailTemplate>();
        public ICollection<SmtpAccount> SmtpAccounts { get; set; } = new List<SmtpAccount>();
        public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
        public ICollection<ContactList> ContactLists { get; set; } = new List<ContactList>();
    }
}
