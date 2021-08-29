using System.Collections.Generic;

namespace HomeBudget_Web_API.Models
{
    public class CurrencySaveRatesRequest
    {
        public IReadOnlyCollection<CurrencyRate> CurrencyRates { get; set; }
    }
}
