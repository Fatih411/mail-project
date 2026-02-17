using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MailProject.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddContactsAndTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BounceReason",
                table: "MailLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClickedAt",
                table: "MailLogs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBounced",
                table: "MailLogs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "OpenedAt",
                table: "MailLogs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrackingId",
                table: "MailLogs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ContactLists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactLists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactLists_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsUnsubscribed = table.Column<bool>(type: "boolean", nullable: false),
                    UnsubscribedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contacts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContactListMembers",
                columns: table => new
                {
                    ContactListsId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContactsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactListMembers", x => new { x.ContactListsId, x.ContactsId });
                    table.ForeignKey(
                        name: "FK_ContactListMembers_ContactLists_ContactListsId",
                        column: x => x.ContactListsId,
                        principalTable: "ContactLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContactListMembers_Contacts_ContactsId",
                        column: x => x.ContactsId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContactListMembers_ContactsId",
                table: "ContactListMembers",
                column: "ContactsId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactLists_UserId",
                table: "ContactLists",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_UserId",
                table: "Contacts",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactListMembers");

            migrationBuilder.DropTable(
                name: "ContactLists");

            migrationBuilder.DropTable(
                name: "Contacts");

            migrationBuilder.DropColumn(
                name: "BounceReason",
                table: "MailLogs");

            migrationBuilder.DropColumn(
                name: "ClickedAt",
                table: "MailLogs");

            migrationBuilder.DropColumn(
                name: "IsBounced",
                table: "MailLogs");

            migrationBuilder.DropColumn(
                name: "OpenedAt",
                table: "MailLogs");

            migrationBuilder.DropColumn(
                name: "TrackingId",
                table: "MailLogs");
        }
    }
}
