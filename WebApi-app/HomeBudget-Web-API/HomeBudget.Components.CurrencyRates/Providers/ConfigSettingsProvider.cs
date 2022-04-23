using System.Text.Json;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.Components.CurrencyRates.Providers
{
    internal class ConfigSettingsProvider : IConfigSettingsProvider
    {
        private const string GeneralConfigSettingsKey = "General";

        private readonly IBaseWriteRepository _baseWriteRepository;
        private readonly IBaseReadRepository _readRepository;

        public ConfigSettingsProvider(
            IBaseWriteRepository baseWriteRepository,
            IBaseReadRepository readRepository)
        {
            _baseWriteRepository = baseWriteRepository;
            _readRepository = readRepository;
        }

        public async Task<ConfigSettings> GetDefaultSettingsAsync()
        {
            const string query = "SELECT [Settings] FROM [ConfigSettings] WHERE [Key] = @Key";

            var configAsJson = await _readRepository.SingleAsync<string>(
                query,
                new
                {
                    Key = GeneralConfigSettingsKey
                });

            return JsonSerializer.Deserialize<ConfigSettings>(configAsJson);
        }

        public async Task<int> SaveDefaultSettingsAsync(ConfigSettings settings)
        {
            var settingsAsJson = JsonSerializer.Serialize(settings);

            const string query = "UPDATE [ConfigSettings]" +
                                    "SET Settings = @settings" +
                                  "WHERE [Key] = @Key";

            return await _baseWriteRepository.SaveAsync(
                query,
                new
                {
                    Key = GeneralConfigSettingsKey,
                    settings = settingsAsJson
                });
        }
    }
}
