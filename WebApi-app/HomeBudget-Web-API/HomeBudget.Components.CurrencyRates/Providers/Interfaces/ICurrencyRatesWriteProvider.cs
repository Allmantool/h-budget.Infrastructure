using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;

namespace HomeBudget.Components.CurrencyRates.Providers.Interfaces
{
    public interface ICurrencyRatesWriteProvider
    {
        Task<int> UpsertRatesSaveAsync(IReadOnlyCollection<CurrencyRate> rates);
    }
}
