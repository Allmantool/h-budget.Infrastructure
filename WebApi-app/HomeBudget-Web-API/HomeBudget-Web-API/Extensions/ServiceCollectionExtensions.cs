using HomeBudget.Components.CurrencyRates.Providers;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Components.CurrencyRates.Services;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;
using HomeBudget.Core.Constants;
using HomeBudget.Core.Models;
using HomeBudget.DataAccess.Dapper.SqlClients.MsSql;
using HomeBudget.DataAccess.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBudget_Web_API.Extensions
{
    internal static class ServiceCollectionExtensions
    {
        public static IServiceCollection SetUpDi(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.Configure<DatabaseOptions>(
                configuration.GetSection(ConfigurationSectionKeys.DatabaseOptions));

            //TODO: Move to separate files
            services.AddScoped<ICurrencyRatesWriteProvider, CurrencyRatesWriteProvider>();
            services.AddScoped<ICurrencyRatesReadProvider, CurrencyRatesReadProvider>();
            services.AddScoped<IBaseWriteRepository, DapperWriteRepository>();
            services.AddScoped<IBaseReadRepository, DapperReadRepository>();
            services.AddScoped<ICurrencyRatesService, CurrencyRatesService>();

            return services;
        }
    }
}
