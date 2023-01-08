using System.Collections.Generic;

using HomeBudget.Components.CurrencyRates.Models;

namespace HomeBudget.Components.CurrencyRates.Commands
{
    public class SaveCurrencyRatesCommand
    {
        public IReadOnlyCollection<CurrencyRate> RatesFromDatabase { get; }
        public IReadOnlyCollection<CurrencyRate> RatesFromApiCall { get; }

        public SaveCurrencyRatesCommand(
            IReadOnlyCollection<CurrencyRate> ratesFromApiCall,
            IReadOnlyCollection<CurrencyRate> ratesFromDatabase)
        {
            RatesFromApiCall = ratesFromApiCall;
            RatesFromDatabase = ratesFromDatabase;
        }

        public SaveCurrencyRatesCommand(
            IReadOnlyCollection<CurrencyRate> ratesFromApiCall)
        {
            RatesFromApiCall = ratesFromApiCall;
        }
    }
}
