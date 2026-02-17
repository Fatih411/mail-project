using Microsoft.EntityFrameworkCore;
using MailProject.Domain.Entities;
using MailProject.Domain.Common;

namespace MailProject.Infrastructure.Persistence
{
    public class MailDbContext : DbContext
    {
        public MailDbContext(DbContextOptions<MailDbContext> options) : base(options)
        {
        }

        public DbSet<Package> Packages { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<SmtpAccount> SmtpAccounts { get; set; }
        public DbSet<MailTemplate> MailTemplates { get; set; }
        public DbSet<MailLog> MailLogs { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<ContactList> ContactLists { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Global Query Filter for Soft Delete
            modelBuilder.Entity<Package>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<SmtpAccount>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<MailTemplate>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Contact>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ContactList>().HasQueryFilter(e => !e.IsDeleted);

            // Package Configuration
            modelBuilder.Entity<Package>(entity =>
            {
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.DailyMailLimit).IsRequired();
                entity.Property(e => e.SmtpAccountLimit).IsRequired();
                entity.Property(e => e.MaxAttachmentSizeMB).IsRequired();
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            });

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.FullName).HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ApiKey).HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

                entity.HasOne(d => d.Package)
                      .WithMany(p => p.Users)
                      .HasForeignKey(d => d.PackageId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // SmtpAccount Configuration
            modelBuilder.Entity<SmtpAccount>(entity =>
            {
                entity.Property(e => e.Host).HasMaxLength(200);
                entity.Property(e => e.Username).HasMaxLength(100);
                entity.Property(e => e.AccountName).HasMaxLength(100);
                
                entity.HasOne(d => d.User)
                      .WithMany(u => u.SmtpAccounts)
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // MailTemplate Configuration
            modelBuilder.Entity<MailTemplate>(entity =>
            {
                entity.Property(e => e.Title).HasMaxLength(100);
                entity.Property(e => e.Subject).HasMaxLength(200);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

                entity.HasOne(d => d.User)
                      .WithMany(u => u.MailTemplates)
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // MailLog Configuration
            modelBuilder.Entity<MailLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SenderEmail).HasMaxLength(100);
                entity.Property(e => e.RecipientEmail).HasMaxLength(100);
                entity.Property(e => e.Status).HasMaxLength(20);
                entity.Property(e => e.SentAt).HasDefaultValueSql("NOW()");
                
                entity.HasOne(d => d.MailTemplate)
                      .WithMany()
                      .HasForeignKey(d => d.MailTemplateId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.Property(e => e.TrackingId).HasMaxLength(50);
            });

            // Contact Configuration
            modelBuilder.Entity<Contact>(entity =>
            {
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

                entity.HasOne(d => d.User)
                      .WithMany(u => u.Contacts)
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ContactList Configuration
            modelBuilder.Entity<ContactList>(entity =>
            {
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

                entity.HasOne(d => d.User)
                      .WithMany(u => u.ContactLists)
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(d => d.Contacts)
                      .WithMany(p => p.ContactLists)
                      .UsingEntity(j => j.ToTable("ContactListMembers"));
            });
        }
    }
}
