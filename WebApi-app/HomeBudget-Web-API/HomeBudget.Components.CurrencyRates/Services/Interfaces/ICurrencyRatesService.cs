﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HomeBudget.Components.CurrencyRates.CQRS.Commands.Models;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Core.Models;

namespace HomeBudget.Components.CurrencyRates.Services.Interfaces
{
    public interface ICurrencyRatesService
    {
        public Task<Result<int>> SaveWithRewriteAsync(SaveCurrencyRatesCommand saveRatesCommand);

        public Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetRatesAsync();

        public Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetRatesForPeriodAsync(DateTime startDate, DateTime endDate);

        public Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesAsync();
    }
}
