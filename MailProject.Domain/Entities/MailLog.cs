using System;

namespace MailProject.Domain.Entities
{
    public class MailLog
    {
        public Guid Id { get; set; }
        public Guid? JobId { get; set; }
        public string SenderEmail { get; set; } = string.Empty;
        public string RecipientEmail { get; set; } = string.Empty;
        // public string Subject { get; set; } = string.Empty; // Removed as per request
        public string Status { get; set; } = string.Empty; // "Success", "Fail"
        public string? ErrorMessage { get; set; }
        public Guid? UserId { get; set; }
        public Guid? MailTemplateId { get; set; }
        public string TrackingId { get; set; } = Guid.NewGuid().ToString("N");
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public DateTime? OpenedAt { get; set; }
        public DateTime? ClickedAt { get; set; }
        public bool IsBounced { get; set; }
        public string? BounceReason { get; set; }

        // Navigation properties
        public User User { get; set; }
        public MailTemplate MailTemplate { get; set; }
    }
}
