using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

using HomeBudget.Components.CurrencyRates.Extensions;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Core.Constants;
using HomeBudget.Core.Extensions;
using HomeBudget.Core.Models;
using HomeBudget.DataAccess.Dapper.Extensions;
using HomeBudget_Web_API.Middlewares;

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
                 .Configure<CacheStoreOptions>(configuration.GetSection(ConfigurationSectionKeys.CacheStoreOptions))
                 .Configure<ExternalResourceUrls>(configuration.GetSection(ConfigurationSectionKeys.ExternalResourceUrls))
                 .Configure<PollyRetryOptions>(configuration.GetSection(ConfigurationSectionKeys.PollyRetryOptions))
                 .RegisterCoreIoCDependency()
                 .RegisterCurrencyRatedIoCDependency()
                 .RegistryDapperIoCDependencies();

            var serviceProvider = services.BuildServiceProvider();

            var databaseOptions = serviceProvider.GetRequiredService<IOptions<DatabaseOptions>>().Value;
            var configSettingsProvider = serviceProvider.GetRequiredService<IConfigSettingsProvider>();
            var configSetting = await configSettingsProvider.GetDefaultSettingsAsync();
            var redisConnectionMultiplexer = await ConnectionMultiplexer.ConnectAsync(databaseOptions.RedisConnectionString);

            return services
                .AddSingleton(_ => configSetting)
                .AddSingleton(_ => redisConnectionMultiplexer)
                .AddScoped(sp => sp.GetRequiredService<ConnectionMultiplexer>().GetDatabase());
        }

        public static IServiceCollection SetUpHealthCheck(this IServiceCollection services, IConfiguration configuration, string hostUrls)
        {
            var msSqlConnectionString = configuration.GetRequiredSection("DatabaseOptions:ConnectionString").Value;
            var redisConnectionString = configuration.GetRequiredSection("DatabaseOptions:RedisConnectionString").Value;

            if (string.IsNullOrWhiteSpace(msSqlConnectionString) || string.IsNullOrWhiteSpace(redisConnectionString))
            {
                return services;
            }

            services
                .AddHealthChecks()
                .AddCheck("heartbeat", () => HealthCheckResult.Healthy())
                .AddCheck<CustomLogicHealthCheck>(nameof(CustomLogicHealthCheck), tags: new[] { "custom" })
                .AddSqlServer(msSqlConnectionString, tags: new[] { "sqlServer" })
                .AddRedis(redisConnectionString, tags: new[] { "redis" });

            services.AddHealthChecksUI(setupSettings: setup =>
                {
                    setup.AddHealthCheckEndpoint("currency rates service", configuration.GetHealthCheckEndpoint(hostUrls));
                })
                .AddInMemoryStorage();

            return services;
        }
    }
}
