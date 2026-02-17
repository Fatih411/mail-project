using System;
using System.Collections.Generic;

namespace MailProject.Application.DTOs
{
    public class ReportFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; } // "Success", "Fail", "Pending", null/empty for all
        public string? SearchTerm { get; set; } // Recipient Email or Subject
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class ReportItemDto
    {
        public Guid Id { get; set; }
        public DateTime Date { get; set; }
        public string Recipient { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ClickedAt { get; set; }
        public bool IsBounced { get; set; }
        public string? BounceReason { get; set; }
        public int Index { get; set; } // Row number for UI display
    }

    public class ReportResultDto
    {
        public List<ReportItemDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
