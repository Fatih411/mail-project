using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MailProject.Application.Common.Interfaces;

namespace MailProject.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FileUploadController : ControllerBase
    {
        private readonly IFileService _fileService;

        public FileUploadController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var result = await _fileService.UploadFileAsync(
                file.OpenReadStream(), 
                file.FileName, 
                file.ContentType, 
                file.Length, 
                "images", 
                Guid.Parse(userIdClaim.Value));

            if (result.IsSuccess)
                return Ok(result);

            return BadRequest(result);
        }

        [HttpPost("upload-attachment")]
        public async Task<IActionResult> UploadAttachment(IFormFile file)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var result = await _fileService.UploadFileAsync(
                file.OpenReadStream(), 
                file.FileName, 
                file.ContentType, 
                file.Length, 
                "attachments", 
                Guid.Parse(userIdClaim.Value));

            if (result.IsSuccess)
                return Ok(result);

            return BadRequest(result);
        }

        [HttpGet("my-images")]
        public async Task<IActionResult> GetMyImages()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var images = await _fileService.GetUserFilesAsync(Guid.Parse(userIdClaim.Value), "images");
            return Ok(images);
        }
    }
}
