using Microsoft.AspNetCore.Mvc;
using MailProject.Application.Common.Interfaces;
using MailProject.Domain.Entities;

namespace MailProject.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var result = await _authService.RefreshTokenAsync(request.Token, request.RefreshToken);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            var result = await _authService.VerifyEmailAsync(request.Email, request.Code);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            var result = await _authService.ForgotPasswordAsync(email);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var result = await _authService.ResetPasswordAsync(request);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendVerificationCode([FromQuery] string email)
        {
            var result = await _authService.ResendVerificationCodeAsync(email);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }
    }

    public record RefreshTokenRequest(string Token, string RefreshToken);
    public record VerifyEmailRequest(string Email, string Code);
}
