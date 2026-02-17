using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;
using MailProject.Application.DTOs;
using System.Security.Claims;
using System;
using System.Threading.Tasks;

namespace MailProject.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<CommonResponseMessage<DashboardStatsDto>>> GetStats()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(CommonResponseMessage<DashboardStatsDto>.Fail("Unauthorized", 401));
            }

            var result = await _dashboardService.GetUserStatsAsync(userId);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            
            return Ok(result);
        }
    }
}
