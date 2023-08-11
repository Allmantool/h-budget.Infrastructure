﻿using System;

using AutoMapper;

using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Models.Api;

namespace HomeBudget.Components.CurrencyRates.MapperProfileConfigurations
{
    internal class CurrencyRateMappingProfiler : Profile
    {
        private const int RatesPrecision = 5;

        public CurrencyRateMappingProfiler()
        {
            CreateMap<NationalBankCurrencyRate, CurrencyRate>()
                .ForMember(
                    dest => dest.RatePerUnit,
                    opt => opt.MapFrom(src => Math.Round((decimal)src.OfficialRate / src.Scale, RatesPrecision)));

            CreateMap<NationalBankShortCurrencyRate, CurrencyRate>();
        }
    }
}
