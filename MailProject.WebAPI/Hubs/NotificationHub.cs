using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace MailProject.WebAPI.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            // Can map connectionId to UserId here if needed
            await base.OnConnectedAsync();
        }
    }
}
