using System.Threading.Tasks;
using MailProject.Application.Common.Interfaces;
using MailProject.WebAPI.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace MailProject.WebAPI.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(string userId, string message)
        {
            // Assuming client listens to "ReceiveMessage"
            // For targeted user usage, we need a way to map UserId to ConnectionId or use SignalR User identifier (ClaimTypes.NameIdentifier).
            // If UserId is the Claim value used for authentication, Clients.User(userId) works.
            
            await _hubContext.Clients.User(userId).SendAsync("ReceiveMessage", message);
        }

        public async Task SendStatusUpdateAsync(string userId, string status, int count)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveStatus", status, count);
        }
    }
}
