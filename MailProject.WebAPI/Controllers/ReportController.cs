using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;
using MailProject.Application.DTOs;
using System.Security.Claims;
using System.Threading.Tasks;
using System;

namespace MailProject.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpPost("list")]
        public async Task<ActionResult<CommonResponseMessage<ReportResultDto>>> GetReports([FromBody] ReportFilterDto filter)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(CommonResponseMessage<ReportResultDto>.Fail("Unauthorized", 401));
            }

            var result = await _reportService.GetReportsAsync(userId, filter);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);

            return Ok(result);
        }
    }
}
