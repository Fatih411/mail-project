using System.Threading.Tasks;

namespace MailProject.Application.Common.Interfaces
{
    public interface INotificationService
    {
        Task SendNotificationAsync(string userId, string message);
        Task SendStatusUpdateAsync(string userId, string status, int count);
    }
}
