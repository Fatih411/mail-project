using System;
using System.Collections.Generic;

namespace MailProject.Application.DTOs
{
    public class SendMailRequestDto
    {
        public Guid SmtpAccountId { get; set; }
        public Guid MailTemplateId { get; set; }
        public List<string> Recipients { get; set; } = new List<string>();
        public Guid? ContactListId { get; set; }
        public bool SendToAll { get; set; }
        public DateTime? ScheduledTime { get; set; }
    }
}
