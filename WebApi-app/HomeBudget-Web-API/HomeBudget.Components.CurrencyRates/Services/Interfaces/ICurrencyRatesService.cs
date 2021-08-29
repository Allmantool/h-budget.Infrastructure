using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;

namespace HomeBudget.Components.CurrencyRates.Services.Interfaces
{
    public interface ICurrencyRatesService
    {
        public Task<int> SaveTodayRatesIfNotExistAsync(IEnumerable<CurrencyRate> rates);
    }
}
