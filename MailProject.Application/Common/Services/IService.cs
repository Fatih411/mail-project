using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MailProject.Application.Common.Models;

namespace MailProject.Application.Common.Services
{
    public interface IService<T, TDto> 
        where T : class 
        where TDto : class
    {
        Task<PaginatedResponseMessage<TDto>> GetAllAsync(
            Expression<Func<T, bool>>? predicate = null,
            int page = 1, 
            int size = 10);
            
        Task<CommonResponseMessage<TDto>> GetByIdAsync(Guid id);
        Task<CommonResponseMessage<TDto>> AddAsync(TDto dto);
        Task<CommonResponseMessage<bool>> UpdateAsync(TDto dto);
        Task<CommonResponseMessage<bool>> DeleteAsync(Guid id);
    }
}
