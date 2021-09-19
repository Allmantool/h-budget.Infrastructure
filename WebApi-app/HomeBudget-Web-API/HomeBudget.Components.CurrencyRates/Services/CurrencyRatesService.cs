using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;

namespace HomeBudget.Components.CurrencyRates.Services
{
    internal class CurrencyRatesService : ICurrencyRatesService
    {
        private readonly ICurrencyRatesReadProvider _currencyRatesReadProvider;
        private readonly ICurrencyRatesWriteProvider _currencyRatesWriteProvider;

        public CurrencyRatesService(
            ICurrencyRatesReadProvider currencyRatesReadProvider,
            ICurrencyRatesWriteProvider currencyRatesWriteProvider)
        {
            _currencyRatesReadProvider = currencyRatesReadProvider;
            _currencyRatesWriteProvider = currencyRatesWriteProvider;
        }

        public async Task<int> SaveTodayRatesIfNotExistAsync(IEnumerable<CurrencyRate> rates)
        {
            var todayRates = await _currencyRatesReadProvider.GetTodayRatesAsync();

            return todayRates.Any() || !rates.Any()
                ? default
                : await _currencyRatesWriteProvider.SaveRatesAsync(rates);
        }
    }
}
