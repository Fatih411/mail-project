using System;
using System.Collections.Generic;
using MailProject.Domain.Common;

namespace MailProject.Domain.Entities
{
    public class Contact : BaseEntity
    {
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsUnsubscribed { get; set; }
        public DateTime? UnsubscribedAt { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<ContactList> ContactLists { get; set; } = new List<ContactList>();
    }
}
