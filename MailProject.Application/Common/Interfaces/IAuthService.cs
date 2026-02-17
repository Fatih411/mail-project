using System;
using System.Threading.Tasks;
using MailProject.Application.Common.Models;
using MailProject.Domain.Entities;

namespace MailProject.Application.Common.Interfaces
{
    public interface IAuthService
    {
        Task<CommonResponseMessage<AuthResponse>> LoginAsync(LoginRequest request);
        Task<CommonResponseMessage<AuthResponse>> RegisterAsync(RegisterRequest request);
        Task<CommonResponseMessage<AuthResponse>> RefreshTokenAsync(string token, string refreshToken);
        Task<CommonResponseMessage<bool>> VerifyEmailAsync(string email, string code);
        Task<CommonResponseMessage<bool>> ForgotPasswordAsync(string email);
        Task<CommonResponseMessage<bool>> ResetPasswordAsync(ResetPasswordRequest request);
        Task<CommonResponseMessage<bool>> ResendVerificationCodeAsync(string email);
    }

    public record AuthResponse(string Token, string RefreshToken, DateTime Expiration, string Name, string Email, string Role);
    public record LoginRequest(string Email, string Password);
    public record RegisterRequest(string FullName, string Email, string Password, Guid? PackageId);
    public record ResetPasswordRequest(string Email, string Token, string NewPassword);
}
