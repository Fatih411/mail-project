using System;
using MailProject.Domain.Common;

namespace MailProject.Domain.Entities
{
    public class MailTemplate : BaseEntity
    {
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string HtmlContent { get; set; } = string.Empty;
        public string? CcList { get; set; }
        public string? BccList { get; set; }
        
        // Navigation property
        public User User { get; set; } = null!;
    }
}
