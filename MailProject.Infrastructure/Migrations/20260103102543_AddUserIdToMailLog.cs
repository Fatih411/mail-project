using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MailProject.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToMailLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "MailLogs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MailLogs_UserId",
                table: "MailLogs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_MailLogs_Users_UserId",
                table: "MailLogs",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MailLogs_Users_UserId",
                table: "MailLogs");

            migrationBuilder.DropIndex(
                name: "IX_MailLogs_UserId",
                table: "MailLogs");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "MailLogs");
        }
    }
}
