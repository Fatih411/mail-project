using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using MailProject.Application.Common.Models;
using MailProject.Application.Common.Repositories;

namespace MailProject.Application.Common.Services
{
    public abstract class Service<T, TDto> : IService<T, TDto>
        where T : class
        where TDto : class
    {
        protected readonly IRepository<T> _repository;
        protected readonly IMapper _mapper;

        public Service(IRepository<T> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public virtual async Task<PaginatedResponseMessage<TDto>> GetAllAsync(
            Expression<Func<T, bool>>? predicate = null,
            int page = 1, 
            int size = 10)
        {
            try 
            {
                var (items, totalCount) = await _repository.GetPagedAsync(predicate, page, size);
                var dtos = _mapper.Map<IEnumerable<TDto>>(items);

                return PaginatedResponseMessage<TDto>.Success(dtos, page, size, totalCount);
            }
            catch (Exception ex)
            {
                return new PaginatedResponseMessage<TDto> 
                { 
                    Message = ex.Message, 
                    StatusCode = 500, 
                    Title = "Error",
                    Data = new List<TDto>(),
                    Page = page,
                    Size = size,
                    TotalCount = 0
                };
            }
        }

        public virtual async Task<CommonResponseMessage<TDto>> GetByIdAsync(Guid id)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return CommonResponseMessage<TDto>.Fail("Not Found", 404);
                
                return CommonResponseMessage<TDto>.Success(_mapper.Map<TDto>(entity));
            }
            catch (Exception ex) 
            {
                return CommonResponseMessage<TDto>.Fail(ex.Message, 500);
            }
        }

        public virtual async Task<CommonResponseMessage<TDto>> AddAsync(TDto dto)
        {
            try
            {
                var entity = _mapper.Map<T>(dto);
                await _repository.AddAsync(entity);
                return CommonResponseMessage<TDto>.Success(_mapper.Map<TDto>(entity), "Created", 201);
            }
            catch (Exception ex)
            {
                return CommonResponseMessage<TDto>.Fail(ex.Message, 500);
            }
        }

        public virtual async Task<CommonResponseMessage<bool>> UpdateAsync(TDto dto)
        {
            try
            {
                var entity = _mapper.Map<T>(dto);
                await _repository.UpdateAsync(entity);
                return CommonResponseMessage<bool>.Success(true, "Updated");
            }
            catch (Exception ex)
            {
                 return CommonResponseMessage<bool>.Fail(ex.Message, 500);
            }
        }

        public virtual async Task<CommonResponseMessage<bool>> DeleteAsync(Guid id)
        {
            try
            {
                await _repository.DeleteAsync(id);
                return CommonResponseMessage<bool>.Success(true, "Deleted");
            }
            catch (Exception ex)
            {
                 return CommonResponseMessage<bool>.Fail(ex.Message, 500);
            }
        }
    }
}
