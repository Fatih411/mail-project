using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using MailProject.Infrastructure.Persistence;
using MailProject.Application.Common.Interfaces;

namespace MailProject.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrackingController : ControllerBase
    {
        private readonly MailDbContext _context;
        private readonly IContactService _contactService;
        private readonly ILogger<TrackingController> _logger;

        public TrackingController(MailDbContext context, IContactService contactService, ILogger<TrackingController> logger)
        {
            _context = context;
            _contactService = contactService;
            _logger = logger;
        }

        [HttpGet("open/{trackingId}")]
        public async Task<IActionResult> TrackOpen(string trackingId)
        {
            _logger.LogInformation("TrackOpen hit for TrackingId: {TrackingId}", trackingId);
            var log = await _context.MailLogs.FirstOrDefaultAsync(l => l.TrackingId == trackingId);
            if (log != null)
            {
                if (log.OpenedAt == null)
                {
                    log.OpenedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Marked as opened: {TrackingId}", trackingId);
                }
                else
                {
                    _logger.LogInformation("Already opened: {TrackingId}", trackingId);
                }
            }
            else
            {
                _logger.LogWarning("Mail log not found for TrackingId: {TrackingId}", trackingId);
            }

            // Return a 1x1 transparent GIF pixel
            byte[] pixel = Convert.FromBase64String("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
            return File(pixel, "image/gif");
        }

        [HttpGet("click/{trackingId}")]
        public async Task<IActionResult> TrackClick(string trackingId, [FromQuery] string url)
        {
            _logger.LogInformation("TrackClick hit for TrackingId: {TrackingId}, Target: {Url}", trackingId, url);
            var log = await _context.MailLogs.FirstOrDefaultAsync(l => l.TrackingId == trackingId);
            if (log != null)
            {
                log.ClickedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                _logger.LogInformation("Marked as clicked: {TrackingId}", trackingId);
            }
            else
            {
                _logger.LogWarning("Mail log not found for TrackingId: {TrackingId} during click", trackingId);
            }

            if (string.IsNullOrEmpty(url)) return Redirect("/");
            return Redirect(url);
        }

        [HttpGet("unsubscribe/{trackingId}")]
        public async Task<IActionResult> Unsubscribe(string trackingId)
        {
            var result = await _contactService.UnsubscribeContactAsync(trackingId);
            if (result.IsSuccess)
            {
                return Content("<html><body><h1>Abonelikten ayrıldınız.</h1><p>E-posta listelerimizden başarıyla çıkarıldınız.</p></body></html>", "text/html");
            }
            return BadRequest(result.Message);
        }
    }
}
