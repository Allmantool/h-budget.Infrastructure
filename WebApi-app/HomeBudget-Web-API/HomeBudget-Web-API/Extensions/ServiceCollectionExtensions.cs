using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HomeBudget.Components.CurrencyRates.Extensions;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Core.Constants;
using HomeBudget.Core.Models;
using HomeBudget.DataAccess.Dapper.Extensions;

namespace HomeBudget_Web_API.Extensions
{
    internal static class ServiceCollectionExtensions
    {
        public static async Task<IServiceCollection> SetUpDiAsync(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services
                 .Configure<DatabaseOptions>(configuration.GetSection(ConfigurationSectionKeys.DatabaseOptions))
                 .RegisterCurrencyRatedIoCDependency()
                 .RegistryDapperIoCDependencies();

            var serviceProvider = services.BuildServiceProvider();
            var configSettingsProvider = serviceProvider.GetRequiredService<IConfigSettingsProvider>();
            var configSetting = await configSettingsProvider.GetDefaultSettingsAsync();

            services.AddSingleton(_ => configSetting);

            return services;
        }
    }
}
