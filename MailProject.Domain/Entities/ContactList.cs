using System;
using System.Collections.Generic;
using MailProject.Domain.Common;

namespace MailProject.Domain.Entities
{
    public class ContactList : BaseEntity
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
    }
}
