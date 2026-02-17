using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MailProject.Application.Common.Interfaces;
using MailProject.Application.Common.Models;
using MailProject.Application.Common.Repositories;
using MailProject.Application.Common.Services;
using MailProject.Application.DTOs;
using MailProject.Domain.Entities;
using MailProject.Infrastructure.Persistence;

namespace MailProject.Infrastructure.Services
{
    public class PackageService : Service<Package, PackageDto>, IPackageService
    {
        public PackageService(IRepository<Package> repository, IMapper mapper) : base(repository, mapper)
        {
        }

        public async Task<CommonResponseMessage<IEnumerable<PackageDto>>> GetActivePackagesAsync()
        {
            var packages = await _repository.GetAllAsync(); 
            var activePackages = packages.Where(p => p.IsActive && !p.IsDeleted).ToList();
            var dtos = _mapper.Map<IEnumerable<PackageDto>>(activePackages);
            
            return CommonResponseMessage<IEnumerable<PackageDto>>.Success(dtos);
        }
    }

    public class SmtpAccountService : Service<SmtpAccount, SmtpAccountDto>, ISmtpAccountService
    {
        private readonly IEncryptionService _encryptionService;

        public SmtpAccountService(IRepository<SmtpAccount> repository, IMapper mapper, IEncryptionService encryptionService) : base(repository, mapper)
        {
            _encryptionService = encryptionService;
        }

        public async Task<CommonResponseMessage<IEnumerable<SmtpAccountDto>>> GetAllByUserIdAsync(Guid userId)
        {
            var accounts = await _repository.FindAsync(x => x.UserId == userId);
            var dtos = _mapper.Map<IEnumerable<SmtpAccountDto>>(accounts);
            return CommonResponseMessage<IEnumerable<SmtpAccountDto>>.Success(dtos);
        }

        public override async Task<CommonResponseMessage<SmtpAccountDto>> AddAsync(SmtpAccountDto dto)
        {
            try 
            {
                if (!string.IsNullOrEmpty(dto.Password))
                {
                    dto.Password = _encryptionService.Encrypt(dto.Password);
                }
                
                return await base.AddAsync(dto);
            }
            catch (Exception ex)
            {
                return CommonResponseMessage<SmtpAccountDto>.Fail(ex.Message, 500);
            }
        }
        
        public override async Task<CommonResponseMessage<bool>> UpdateAsync(SmtpAccountDto dto)
        {
             try
             {
                 // Fetch existing to see if password changed or if we need to keep old one
                 var existing = await _repository.GetByIdAsync(dto.Id);
                 if (existing != null) 
                 {
                     // If password is not empty and different from existing (assumed encrypted in DB), encrypt new one
                     // Simple logic: Always encrypt whatever comes in if not empty. 
                     // Frontend should send empty if not changing password? Or we send back encrypted and it sends it back?
                     // Usually for security, we don't send back password. 
                     // TODO: In DTO mapping, we might want to Ignore Password on Read or Mask it.
                     
                     if (!string.IsNullOrEmpty(dto.Password) && dto.Password != existing.Password)
                     {
                         // Basic check: if it looks encrypted (Base64) maybe don't encrypt? No, unsafe.
                         // Let's assume input is always plain text if specifically setting it.
                         dto.Password = _encryptionService.Encrypt(dto.Password);
                     }
                     else if (string.IsNullOrEmpty(dto.Password))
                     {
                         // Keep existing password
                         dto.Password = existing.Password;
                     }
                 }
                 
                 return await base.UpdateAsync(dto);
             }
             catch(Exception ex)
             {
                 return CommonResponseMessage<bool>.Fail(ex.Message, 500);
             }
        }
    }

    public class MailTemplateService : Service<MailTemplate, MailTemplateDto>, IMailTemplateService
    {
        public MailTemplateService(IRepository<MailTemplate> repository, IMapper mapper) : base(repository, mapper)
        {
        }

        public async Task<CommonResponseMessage<IEnumerable<MailTemplateDto>>> GetAllByUserIdAsync(Guid userId)
        {
            var templates = await _repository.FindAsync(t => t.UserId == userId);
            var dtos = _mapper.Map<IEnumerable<MailTemplateDto>>(templates);
            return CommonResponseMessage<IEnumerable<MailTemplateDto>>.Success(dtos);
        }
    }
    
    public class MailLogService : Service<MailLog, MailLogDto>, IMailLogService
    {
        public MailLogService(IRepository<MailLog> repository, IMapper mapper) : base(repository, mapper)
        {
        }

        public async Task<CommonResponseMessage<IEnumerable<MailLogDto>>> GetLogsByJobIdAsync(Guid jobId)
        {
            var logs = await _repository.FindAsync(x => x.JobId == jobId);
            var dtos = _mapper.Map<IEnumerable<MailLogDto>>(logs);
            return CommonResponseMessage<IEnumerable<MailLogDto>>.Success(dtos);
        }
    }
}
