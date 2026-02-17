using System;
using System.Collections.Generic;
using MailProject.Domain.Common;

namespace MailProject.Domain.Entities
{
    public class Package : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int DailyMailLimit { get; set; }
        public int SmtpAccountLimit { get; set; }
        public int MaxAttachmentSizeMB { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation property
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
