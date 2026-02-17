using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;

namespace MailProject.WebAPI.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _userService.GetAllUsersAsync();
            return Ok(result);
        }

        [HttpPut("{userId}/package")]
        public async Task<IActionResult> UpdateUserPackage(Guid userId, [FromBody] UpdateUserPackageRequest request)
        {
            var result = await _userService.UpdateUserPackageAsync(userId, request.PackageId, request.PackageEndDate);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }
    }

    public record UpdateUserPackageRequest(Guid PackageId, DateTime? PackageEndDate);
}
