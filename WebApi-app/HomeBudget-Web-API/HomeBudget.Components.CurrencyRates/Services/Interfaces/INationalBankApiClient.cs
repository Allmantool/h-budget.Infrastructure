using System.Collections.Generic;
using System.Threading.Tasks;
using Refit;
using HomeBudget.Components.CurrencyRates.Models.Api;

namespace HomeBudget.Components.CurrencyRates.Services.Interfaces
{
    public interface INationalBankApiClient
    {
        [Get("/")]
        Task WarmUp();

        [Get("/api/exrates/rates?periodicity=0")]
        Task<IEnumerable<NationalBankCurrencyRate>> GetTodayRatesAsync();

        [Get("/api/exrates/currencies")]
        Task<IEnumerable<NationalBankCurrency>> GetCurrenciesAsync();
    }
}
