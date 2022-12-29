﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;

namespace HomeBudget.Components.CurrencyRates.Providers.Interfaces
{
    public interface ICurrencyRatesReadProvider
    {
        Task<IReadOnlyCollection<CurrencyRate>> GetTodayRatesAsync();

        Task<IReadOnlyCollection<CurrencyRate>> GetRatesForPeriodAsync(DateTime startDate, DateTime endDate);

        Task<IReadOnlyCollection<CurrencyRate>> GetRatesAsync();
    }
}
