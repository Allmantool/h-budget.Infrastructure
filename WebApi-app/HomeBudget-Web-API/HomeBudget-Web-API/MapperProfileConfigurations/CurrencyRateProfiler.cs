using AutoMapper;
using HomeBudget_Web_API.Models;

namespace HomeBudget_Web_API.MapperProfileConfigurations
{
    public class CurrencyRateProfiler : Profile
    {
        public CurrencyRateProfiler()
            => CreateMap<CurrencyRate, HomeBudget.Components.CurrencyRates.Models.CurrencyRate>()
                .ForMember(dest =>
                    dest.CurrencyId,
                    opt => opt.MapFrom(src => src.Id));
    }
}
