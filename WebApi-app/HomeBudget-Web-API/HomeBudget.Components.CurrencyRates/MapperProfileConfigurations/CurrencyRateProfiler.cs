using System;
using AutoMapper;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Models.Api;

namespace HomeBudget.Components.CurrencyRates.MapperProfileConfigurations
{
    internal class CurrencyRateProfiler : Profile
    {
        public CurrencyRateProfiler()
        {
            CreateMap<NationalBankCurrencyRate, CurrencyRate>()
                .ForMember(
                    dest => dest.RatePerUnit,
                    opt => opt.MapFrom(src => Math.Round((decimal)src.OfficialRate / src.Scale, 4)));

            CreateMap<NationalBankShortCurrencyRate, CurrencyRate>();
        }
    }
}
