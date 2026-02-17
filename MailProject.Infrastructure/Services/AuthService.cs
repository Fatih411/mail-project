using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;
using MailProject.Domain.Entities;
using MailProject.Infrastructure.Persistence;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace MailProject.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly MailDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEncryptionService _encryptionService;
        private readonly IMailService _mailService; // Need to verify if this circular dependency happens or fine

        public AuthService(MailDbContext context, IConfiguration configuration, IEncryptionService encryptionService, IMailService mailService)
        {
            _context = context;
            _configuration = configuration;
            _encryptionService = encryptionService;
            _mailService = mailService;
        }

        public async Task<CommonResponseMessage<AuthResponse>> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.Include(u => u.Package).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return CommonResponseMessage<AuthResponse>.Fail("Invalid credentials", 401);

            // TODO: Use Hash check - For now simple string match as per previous partial impl
            if (user.PasswordHash != request.Password) return CommonResponseMessage<AuthResponse>.Fail("Invalid credentials", 401);

            if (!user.IsVerified) return CommonResponseMessage<AuthResponse>.Fail("Email not verified", 403);

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            return CommonResponseMessage<AuthResponse>.Success(new AuthResponse(token, refreshToken, DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:ExpirationInMinutes"] ?? "60")), user.FullName, user.Email, user.Role.ToString()));
        }

        public async Task<CommonResponseMessage<AuthResponse>> RegisterAsync(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return CommonResponseMessage<AuthResponse>.Fail("Email already exists", 400);

            Guid packageId;
            if (request.PackageId.HasValue)
            {
                var package = await _context.Packages.FindAsync(request.PackageId.Value);
                if (package == null) return CommonResponseMessage<AuthResponse>.Fail("Invalid Package", 400);
                packageId = package.Id;
            }
            else
            {
                // Default Package Logic ("Başlangıç Paketi")
                var defaultPackage = await _context.Packages.FirstOrDefaultAsync(p => p.Name == "Başlangıç Paketi");
                if (defaultPackage == null)
                {
                    defaultPackage = new Package
                    {
                        Id = Guid.NewGuid(),
                        Name = "Başlangıç Paketi",
                        DailyMailLimit = 100, // Reasonable default
                        SmtpAccountLimit = 1,
                        MaxAttachmentSizeMB = 5,
                        IsActive = true,
                        Price = 0
                    };
                    await _context.Packages.AddAsync(defaultPackage);
                    await _context.SaveChangesAsync();
                }
                packageId = defaultPackage.Id;
            }

            var user = new User
            {
                Email = request.Email,
                FullName = request.FullName,
                PasswordHash = request.Password, // TODO: Hash this
                PackageId = packageId,
                PackageStartDate = DateTime.UtcNow,
                PackageEndDate = DateTime.UtcNow.AddMonths(1), // Default 1 month for now, logic can vary
                VerificationCode = new Random().Next(100000, 999999).ToString(),
                IsVerified = false
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Send Verification Email
            var systemSmtpConfig = _configuration.GetSection("SystemSmtp");
            if (systemSmtpConfig.Exists())
            {
                var systemSmtp = new SmtpAccount
                {
                    Host = systemSmtpConfig["Host"]!,
                    Port = int.Parse(systemSmtpConfig["Port"]!),
                    Username = systemSmtpConfig["Username"]!,
                    Password = systemSmtpConfig["Password"]!, // Encrypted in appsettings usually
                    EnableSsl = bool.Parse(systemSmtpConfig["EnableSsl"]!),
                    AccountName = systemSmtpConfig["FromName"]!
                };

                // Ideally we shouldn't expose the raw password in SmtpAccount if it expects encrypted, 
                // but MailKitService calls _encryptionService.Decrypt(). 
                // If appsettings has Plaintext, we might need to encrypt it first or handle it?
                // For simplicity here: assuming appsettings has ENCRYPTED password suitable for Decrypt().
                // OR: modify MailKitService to take a flag? No, let's just encrypt it on the fly if needed
                // or assume user puts encrypted string in appsettings.
                // Let's assume it IS encrypted in appsettings.

                var subject = "E-Posta Doğrulama - Mailim";
                var body = GetVerificationEmailTemplate(user.FullName, user.VerificationCode);
                
                // Fire and forget? No, wait for it.
                await _mailService.SendEmailAsync(systemSmtp, user.Email, subject, body, userId: user.Id);
            }

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            return CommonResponseMessage<AuthResponse>.Success(new AuthResponse(token, refreshToken, DateTime.UtcNow.AddMinutes(60), user.FullName, user.Email, user.Role.ToString()), "User created. Check email for verification code.");
        }

        public async Task<CommonResponseMessage<AuthResponse>> RefreshTokenAsync(string token, string refreshToken)
        {
            var principal = GetPrincipalFromExpiredToken(token);
            if (principal == null) return CommonResponseMessage<AuthResponse>.Fail("Invalid token", 400);

            var email = principal.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                return CommonResponseMessage<AuthResponse>.Fail("Invalid refresh token", 400);

            var newToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            await _context.SaveChangesAsync();

            return CommonResponseMessage<AuthResponse>.Success(new AuthResponse(newToken, newRefreshToken, DateTime.UtcNow.AddMinutes(60), user.FullName, user.Email, user.Role.ToString()));
        }

        public async Task<CommonResponseMessage<bool>> VerifyEmailAsync(string email, string code)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return CommonResponseMessage<bool>.Fail("User not found", 404);

            if (user.VerificationCode == code)
            {
                user.IsVerified = true;
                user.VerificationCode = null;
                await _context.SaveChangesAsync();
                return CommonResponseMessage<bool>.Success(true, "Email verified");
            }

            return CommonResponseMessage<bool>.Fail("Invalid code", 400);
        }

        public async Task<CommonResponseMessage<bool>> ForgotPasswordAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return CommonResponseMessage<bool>.Fail("User not found", 404);
            
            if (!user.IsVerified) return CommonResponseMessage<bool>.Fail("E-posta adresiniz doğrulanmamış. Şifre sıfırlama işlemi yapamazsınız.", 403);

            user.VerificationCode = new Random().Next(100000, 999999).ToString();
            await _context.SaveChangesAsync();

            // Send Reset Email
            var systemSmtpConfig = _configuration.GetSection("SystemSmtp");
            if (systemSmtpConfig.Exists())
            {
                var systemSmtp = new SmtpAccount
                {
                    Host = systemSmtpConfig["Host"]!,
                    Port = int.Parse(systemSmtpConfig["Port"]!),
                    Username = systemSmtpConfig["Username"]!,
                    Password = systemSmtpConfig["Password"]!,
                    EnableSsl = bool.Parse(systemSmtpConfig["EnableSsl"]!),
                    AccountName = systemSmtpConfig["FromName"]!
                };

                var subject = "Şifre Sıfırlama Kodu - Mailim";
                var body = GetResetPasswordEmailTemplate(user.FullName, user.VerificationCode);

                await _mailService.SendEmailAsync(systemSmtp, user.Email, subject, body, userId: user.Id);
            }

            return CommonResponseMessage<bool>.Success(true, "Reset code sent");
        }

        public async Task<CommonResponseMessage<bool>> ResetPasswordAsync(ResetPasswordRequest request)
        {
             var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
             if (user == null) return CommonResponseMessage<bool>.Fail("User not found", 404);

             if (user.VerificationCode != request.Token)
                return CommonResponseMessage<bool>.Fail("Invalid token", 400);

             user.PasswordHash = request.NewPassword; // TODO: Hash
             user.VerificationCode = null;
             await _context.SaveChangesAsync();

             return CommonResponseMessage<bool>.Success(true, "Password reset successfully");
        }

        public async Task<CommonResponseMessage<bool>> ResendVerificationCodeAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return CommonResponseMessage<bool>.Fail("User not found", 404);
            if (user.IsVerified) return CommonResponseMessage<bool>.Fail("User already verified", 400);

            user.VerificationCode = new Random().Next(100000, 999999).ToString();
            await _context.SaveChangesAsync();

            // Send Verification Email
            var systemSmtpConfig = _configuration.GetSection("SystemSmtp");
            if (systemSmtpConfig.Exists())
            {
                var systemSmtp = new SmtpAccount
                {
                    Host = systemSmtpConfig["Host"]!,
                    Port = int.Parse(systemSmtpConfig["Port"]!),
                    Username = systemSmtpConfig["Username"]!,
                    Password = systemSmtpConfig["Password"]!, 
                    EnableSsl = bool.Parse(systemSmtpConfig["EnableSsl"]!),
                    AccountName = systemSmtpConfig["FromName"]!
                };

                var subject = "Yeni Doğrulama Kodu - Mailim";
                var body = GetVerificationEmailTemplate(user.FullName, user.VerificationCode);
                
                await _mailService.SendEmailAsync(systemSmtp, user.Email, subject, body, userId: user.Id);
            }

            return CommonResponseMessage<bool>.Success(true, "Verification code sent");
        }

        private string GetVerificationEmailTemplate(string fullName, string code)
        {
            return $@"
<div style=""font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px;"">
    <div style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;"">
<div style=""background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center;"">
            <h1 style=""color: white; margin: 0; font-size: 28px; font-weight: 700;"">Mailim</h1>
            <p style=""color: #e0e7ff; margin-top: 5px; font-size: 16px;"">Hoş Geldiniz!</p>
        </div>
        <div style=""padding: 40px 30px; text-align: center;"">
            <h2 style=""color: #1f2937; margin-top: 0; font-size: 22px;"">E-Posta Doğrulama</h2>
            <p style=""color: #4b5563; line-height: 1.6; margin-bottom: 30px;"">
                Merhaba <strong>{fullName}</strong>,<br>
                Hesabınızı güvenli tutmak için lütfen aşağıdaki doğrulama kodunu kullanın.
            </p>
            <div style=""background-color: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 8px; padding: 20px; margin: 0 auto 30px; display: inline-block;"">
                <span style=""font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #4f46e5; user-select: all;"">{code}</span>
            </div>
            <p style=""color: #6b7280; font-size: 14px;"">Bu kodu doğrulamak için uygulamaya girin.</p>
        </div>
        <div style=""background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;"">
            <p style=""color: #9ca3af; font-size: 12px; margin: 0;"">&copy; {DateTime.Now.Year} Mailim Systems. Tüm hakları saklıdır.</p>
        </div>
    </div>
</div>";
        }

        private string GetResetPasswordEmailTemplate(string fullName, string code)
        {
            return $@"
<div style=""font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px;"">
    <div style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;"">
        <div style=""background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 30px; text-align: center;"">
            <h1 style=""color: white; margin: 0; font-size: 28px; font-weight: 700;"">Mailim</h1>
            <p style=""color: #fee2e2; margin-top: 5px; font-size: 16px;"">Şifre Sıfırlama</p>
        </div>
        <div style=""padding: 40px 30px; text-align: center;"">
            <h2 style=""color: #1f2937; margin-top: 0; font-size: 22px;"">Şifrenizi mi Unuttunuz?</h2>
            <p style=""color: #4b5563; line-height: 1.6; margin-bottom: 30px;"">
                Merhaba <strong>{fullName}</strong>,<br>
                Şifrenizi sıfırlamak için aşağıdaki kodu kullanabilirsiniz.
            </p>
            <div style=""background-color: #fff1f2; border: 2px dashed #fecaca; border-radius: 8px; padding: 20px; margin: 0 auto 30px; display: inline-block;"">
                <span style=""font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #dc2626; user-select: all;"">{code}</span>
            </div>
            <p style=""color: #6b7280; font-size: 14px;"">Bu kodu siz talep etmediyseniz, lütfen dikkate almayınız.</p>
        </div>
        <div style=""background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;"">
            <p style=""color: #9ca3af; font-size: 12px; margin: 0;"">&copy; {DateTime.Now.Year} Mailim Systems. Tüm hakları saklıdır.</p>
        </div>
    </div>
</div>";
        }
    
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                }),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:ExpirationInMinutes"] ?? "60")),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"]
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]!)),
                ValidateLifetime = false // Here we are validating an expired token
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal;
        }
    }
}
