using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MailProject.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubjectToMailLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "MailLogs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Subject",
                table: "MailLogs");
        }
    }
}
