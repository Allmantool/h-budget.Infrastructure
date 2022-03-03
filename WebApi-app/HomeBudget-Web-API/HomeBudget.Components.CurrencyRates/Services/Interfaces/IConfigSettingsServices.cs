using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Core.Models;

namespace HomeBudget.Components.CurrencyRates.Services.Interfaces
{
    public interface IConfigSettingsServices
    {
        public Task<Result<IReadOnlyCollection<Currency>>> GetAvailableCurrencies();

        public Task<Result<int>> SaveSettingsAsync(ConfigSettings settings);

        public Task<Result<ConfigSettings>> GetSettingsAsync();
    }
}
