using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailProject.Application.Common.Services;
using MailProject.Application.Common.Models;
using System;
using System.Threading.Tasks;

namespace MailProject.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public abstract class BaseController<T, TDto> : ControllerBase
        where T : class
        where TDto : class
    {
        protected readonly IService<T, TDto> _service;

        public BaseController(IService<T, TDto> service)
        {
            _service = service;
        }

        [HttpGet]
        public virtual async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var result = await _service.GetAllAsync(page: page, size: size);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public virtual async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPost]
        public virtual async Task<IActionResult> Create([FromBody] TDto dto)
        {
            var result = await _service.AddAsync(dto);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpPut]
        public virtual async Task<IActionResult> Update([FromBody] TDto dto)
        {
            var result = await _service.UpdateAsync(dto);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public virtual async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result.IsSuccess) return StatusCode(result.StatusCode, result);
            return Ok(result);
        }
    }
}
