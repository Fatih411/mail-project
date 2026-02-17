using System;
using MailProject.Domain.Common;

namespace MailProject.Domain.Entities
{
    public class SmtpAccount : BaseEntity
    {
        public Guid UserId { get; set; }
        public string AccountName { get; set; } = string.Empty; // e.g. "Work Mail", "Marketing"
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // Encrypted
        public bool EnableSsl { get; set; }
        public bool IsDefault { get; set; }

        // Navigation
        public User User { get; set; } = null!;
    }
}
