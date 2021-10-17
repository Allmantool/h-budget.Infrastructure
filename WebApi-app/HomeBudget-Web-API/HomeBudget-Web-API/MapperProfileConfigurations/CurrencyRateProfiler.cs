using AutoMapper;
using HomeBudget.Components.CurrencyRates.Models;
using Api = HomeBudget_Web_API.Models;

namespace HomeBudget_Web_API.MapperProfileConfigurations
{
    internal class CurrencyRateProfiler : Profile
    {
        public CurrencyRateProfiler()
            => CreateMap<Api.CurrencyRate, CurrencyRate>()
                .ForMember(
                    dest => dest.CurrencyId,
                    opt => opt.MapFrom(src => src.Id));
    }
}
