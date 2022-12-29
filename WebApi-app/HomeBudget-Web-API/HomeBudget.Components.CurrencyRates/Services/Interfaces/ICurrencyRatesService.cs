using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Core.Models;

namespace HomeBudget.Components.CurrencyRates.Services.Interfaces
{
    public interface ICurrencyRatesService
    {
        public Task<Result<int>> SaveIfNotExistAsync(
            IReadOnlyCollection<CurrencyRate> ratesFromDatabase,
            IReadOnlyCollection<CurrencyRate> ratesFromApiCall = null);

        public Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetRatesAsync();

        public Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesForPeriodAsync(DateTime startDate, DateTime endDate);

        public Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesAsync();
    }
}
