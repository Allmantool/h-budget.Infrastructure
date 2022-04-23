using AutoMapper;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Models.Api;

namespace HomeBudget_Web_API.MapperProfileConfigurations
{
    internal class CurrencyProfiler : Profile
    {
        public CurrencyProfiler()
            => CreateMap<NationalBankCurrency, Currency>();
    }
}
