using AutoMapper;
using MailProject.Application.DTOs;
using MailProject.Domain.Entities;

namespace MailProject.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Package, PackageDto>().ReverseMap();
            CreateMap<SmtpAccount, SmtpAccountDto>().ReverseMap();
            CreateMap<MailTemplate, MailTemplateDto>().ReverseMap();
            CreateMap<MailLog, MailLogDto>().ReverseMap();
        }
    }
}
