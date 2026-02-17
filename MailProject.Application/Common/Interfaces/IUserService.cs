using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MailProject.Application.Common.Models;
using MailProject.Application.DTOs;

namespace MailProject.Application.Common.Interfaces
{
    public interface IUserService
    {
        Task<CommonResponseMessage<List<UserDto>>> GetAllUsersAsync();
        Task<CommonResponseMessage<bool>> UpdateUserPackageAsync(Guid userId, Guid packageId, DateTime? packageEndDate = null);
    }
}
