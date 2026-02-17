using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.DTOs;

namespace MailProject.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ContactsController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactsController(IContactService contactService)
        {
            _contactService = contactService;
        }

        [HttpGet]
        public async Task<IActionResult> GetContacts()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _contactService.GetContactsAsync(userId);
            return Ok(result);
        }

        [HttpGet("lists")]
        public async Task<IActionResult> GetContactLists()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _contactService.GetContactListsAsync(userId);
            return Ok(result);
        }

        [HttpPost("lists")]
        public async Task<IActionResult> CreateList([FromBody] CreateListRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _contactService.CreateContactListAsync(userId, request.Name, request.Description);
            return Ok(result);
        }

        [HttpDelete("lists/{id}")]
        public async Task<IActionResult> DeleteList(Guid id, [FromQuery] bool keepContacts = true)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _contactService.DeleteContactListAsync(userId, id, keepContacts);
            return Ok(result);
        }

        [HttpPost("batch-add")]
        public async Task<IActionResult> BatchAdd([FromBody] BatchAddRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var emails = request.RawEmails
                .Split(new[] { ',', '\n', '\r', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Trim())
                .ToList();
            
            var result = await _contactService.BatchAddContactsAsync(userId, emails, request.ListId);
            return Ok(result);
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportContacts(IFormFile file, [FromQuery] Guid? listId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            using var stream = file.OpenReadStream();
            var result = await _contactService.ImportContactsAsync(userId, stream, file.FileName, listId);
            
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }

        [HttpPost("lists/{id}/add-contact")]
        public async Task<IActionResult> AddContactToList(Guid id, [FromBody] AddContactRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _contactService.AddContactToListAsync(userId, request.Email, id);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _contactService.DeleteContactAsync(userId, id);
            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateContact([FromBody] ContactDto contactDto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _contactService.UpdateContactAsync(userId, contactDto);
            return Ok(result);
        }
    }

    public class CreateListRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class AddContactRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class BatchAddRequest
    {
        public string RawEmails { get; set; } = string.Empty;
        public Guid? ListId { get; set; }
    }
}
