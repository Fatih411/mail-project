using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MailProject.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceSubjectWithTemplateIdInMailLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Subject",
                table: "MailLogs");

            migrationBuilder.AddColumn<Guid>(
                name: "MailTemplateId",
                table: "MailLogs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MailLogs_MailTemplateId",
                table: "MailLogs",
                column: "MailTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_MailLogs_MailTemplates_MailTemplateId",
                table: "MailLogs",
                column: "MailTemplateId",
                principalTable: "MailTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MailLogs_MailTemplates_MailTemplateId",
                table: "MailLogs");

            migrationBuilder.DropIndex(
                name: "IX_MailLogs_MailTemplateId",
                table: "MailLogs");

            migrationBuilder.DropColumn(
                name: "MailTemplateId",
                table: "MailLogs");

            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "MailLogs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
