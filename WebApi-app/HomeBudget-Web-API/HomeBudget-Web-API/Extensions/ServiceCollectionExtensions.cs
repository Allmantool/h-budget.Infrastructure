using HomeBudget.Components.CurrencyRates.Extensions;
using HomeBudget.Core.Constants;
using HomeBudget.Core.Models;
using HomeBudget.DataAccess.Dapper.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HomeBudget_Web_API.Extensions
{
    internal static class ServiceCollectionExtensions
    {
        public static IServiceCollection SetUpDi(
            this IServiceCollection services,
            IConfiguration configuration) =>
            services
                .Configure<DatabaseOptions>(configuration.GetSection(ConfigurationSectionKeys.DatabaseOptions))
                .RegisterCurrencyRatedIoCDependency()
                .RegistryDapperIoCDependencies();
    }
}
