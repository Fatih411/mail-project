using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.DTOs;
using MailProject.Application.Common.Models;
using System.Security.Claims;

namespace MailProject.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MailController : ControllerBase
    {
        private readonly IMailDispatchService _dispatchService;

        public MailController(IMailDispatchService dispatchService)
        {
            _dispatchService = dispatchService;
        }

        [HttpPost("send")]
        public async Task<ActionResult<CommonResponseMessage<Guid>>> SendMailBatch([FromBody] SendMailRequestDto request)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) 
                return Unauthorized();

            var result = await _dispatchService.DispatchBatchAsync(userId, request);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            
            return Ok(result);
        }
    }
}
