using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.Components.CurrencyRates.Providers
{
    public class CurrencyRatesReadProvider : ICurrencyRatesReadProvider
    {
        private readonly IBaseReadRepository _readRepository;

        public CurrencyRatesReadProvider(IBaseReadRepository readRepository) => _readRepository = readRepository;

        public Task<IEnumerable<CurrencyRate>> GetTodayRatesAsync()
        {
            const string query = "SELECT * FROM [CurrencyRates] WHERE [UpdateDate] = @Today;";

            return _readRepository.GetAsync<CurrencyRate>(
                query,
                new
                {
                    Today = DateTime.Now.ToShortDateString()
                });
        }
    }
}
