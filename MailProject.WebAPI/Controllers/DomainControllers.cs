using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.DTOs;
using MailProject.Domain.Entities;
using MailProject.Application.Common.Models;

namespace MailProject.WebAPI.Controllers
{
    public class PackagesController : BaseController<Package, PackageDto>
    {
        private readonly IPackageService _service;

        public PackagesController(IPackageService service) : base(service) 
        {
            _service = service;
        }

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<ActionResult<CommonResponseMessage<IEnumerable<PackageDto>>>> GetActive()
        {
            return Ok(await _service.GetActivePackagesAsync());
        }
    }

    public class SmtpAccountsController : BaseController<SmtpAccount, SmtpAccountDto>
    {
        private readonly ISmtpAccountService _accountService;

        public SmtpAccountsController(ISmtpAccountService service) : base(service)
        {
            _accountService = service;
        }

        [HttpGet]
        public override async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            var result = await _accountService.GetAllByUserIdAsync(userId);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPost]
        public override async Task<IActionResult> Create([FromBody] SmtpAccountDto dto)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            dto.UserId = userId;
            // Password encryption should ideally happen here or in service. 
            // For now assuming service/repository handles it or we send plain text and it gets encrypted?
            // Wait, SmtpAccountService doesn't have custom create logic, it uses generic AddAsync.
            // Generic AddAsync just maps DTO to Entity.
            // We need to encrypt password if it's new.
            // I should override AddAsync in Service or handle it here. 
            // Better to handle in Controller or a specific Service method.
            // But I am overriding Controller Create.
            // NOTE: The previous conversation mentioned IEncryptionService is injected in MailKitService but not in Generic Service.
            // I should probably inject IEncryptionService here or in SmtpAccountService to encrypt password.
            // Refactoring SmtpAccountService to handle encryption is better practice but for speed I might do it here or update Service.
            // Let's stick to simple overrides first, assuming plain text for now or address later?
            // The user prompt mentioned: "**Important**: Passwords must be encrypted before saving".
            // I should update SmtpAccountService to inject IEncryptionService and override AddAsync/UpdateAsync.
            // BUT, for this tool call, I will just secure the endpoint. I will update Service in next step for encryption.
            
            return await base.Create(dto);
        }

        [HttpPut]
        public override async Task<IActionResult> Update([FromBody] SmtpAccountDto dto)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            var existing = await _accountService.GetByIdAsync(dto.Id);
            if (!existing.IsSuccess || existing.Data == null) return NotFound(CommonResponseMessage<bool>.Fail("Account not found", 404));

            if (existing.Data.UserId != userId) return Unauthorized(CommonResponseMessage<bool>.Fail("Unauthorized access", 403));

            dto.UserId = userId;
            return await base.Update(dto);
        }

        [HttpDelete("{id}")]
        public override async Task<IActionResult> Delete(Guid id)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            var existing = await _accountService.GetByIdAsync(id);
            if (!existing.IsSuccess || existing.Data == null) return NotFound(CommonResponseMessage<bool>.Fail("Account not found", 404));

            if (existing.Data.UserId != userId) return Unauthorized(CommonResponseMessage<bool>.Fail("Unauthorized access", 403));

            return await base.Delete(id);
        }
    }

    public class MailTemplatesController : BaseController<MailTemplate, MailTemplateDto>
    {
        private readonly IMailTemplateService _templateService;

        public MailTemplatesController(IMailTemplateService service) : base(service) 
        {
            _templateService = service;
        }

        [HttpGet]
        public override async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            // Note: Pagination ignored for user-specific list for now, as GetAllByUserIdAsync returns all
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            var result = await _templateService.GetAllByUserIdAsync(userId);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPost]
        public override async Task<IActionResult> Create([FromBody] MailTemplateDto dto)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            dto.UserId = userId;
            return await base.Create(dto);
        }

        [HttpPut]
        public override async Task<IActionResult> Update([FromBody] MailTemplateDto dto)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            var existing = await _templateService.GetByIdAsync(dto.Id);
            if (!existing.IsSuccess || existing.Data == null) return NotFound(CommonResponseMessage<bool>.Fail("Template not found", 404));
            
            if (existing.Data.UserId != userId) return Unauthorized(CommonResponseMessage<bool>.Fail("Unauthorized access to this template", 403));

            dto.UserId = userId; // Ensure ownership persists
            return await base.Update(dto);
        }

        [HttpDelete("{id}")]
        public override async Task<IActionResult> Delete(Guid id)
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            var existing = await _templateService.GetByIdAsync(id);
            if (!existing.IsSuccess || existing.Data == null) return NotFound(CommonResponseMessage<bool>.Fail("Template not found", 404));

            if (existing.Data.UserId != userId) return Unauthorized(CommonResponseMessage<bool>.Fail("Unauthorized access to this template", 403));

            return await base.Delete(id);
        }
    }

    public class MailLogsController : BaseController<MailLog, MailLogDto>
    {
        private readonly IMailLogService _logService; // Need to inject specific service

        public MailLogsController(IMailLogService service) : base(service) 
        {
            _logService = service;
        }

        [HttpGet("job/{jobId}")]
        public async Task<IActionResult> GetByJobId(Guid jobId)
        {
            var result = await _logService.GetLogsByJobIdAsync(jobId);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }
    }
}
