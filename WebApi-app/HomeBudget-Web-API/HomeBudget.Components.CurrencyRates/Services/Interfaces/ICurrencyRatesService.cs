using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Core.Models;

namespace HomeBudget.Components.CurrencyRates.Services.Interfaces
{
    public interface ICurrencyRatesService
    {
        public Task<Result<int>> SaveTodayRatesIfNotExistAsync(IReadOnlyCollection<CurrencyRate> rates);

        public Task<Result<int>> SaveRatesForPeriodIfNotExistAsync(IReadOnlyCollection<CurrencyRate> rates, DateTime startDate, DateTime endDate);

        public Task<Result<IReadOnlyCollection<CurrencyRate>>> GetRatesAsync();

        public Task<Result<IReadOnlyCollection<CurrencyRate>>> GetTodayRatesForPeriodAsync(DateTime startDate, DateTime endDate);

        public Task<Result<IReadOnlyCollection<CurrencyRate>>> GetTodayRatesAsync();
    }
}
