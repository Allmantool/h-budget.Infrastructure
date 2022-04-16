using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Core.Models;

namespace HomeBudget.Components.CurrencyRates.Services.Interfaces
{
    public interface ICurrencyRatesService
    {
        public Task<Result<int>> SaveTodayRatesIfNotExistAsync(IEnumerable<CurrencyRate> rates);

        public Task<Result<IReadOnlyCollection<CurrencyRate>>> GetRatesAsync();

        public Task<Result<IReadOnlyCollection<CurrencyRate>>> GetTodayRatesAsync();
    }
}
