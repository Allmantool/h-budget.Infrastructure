﻿using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using HomeBudget.Components.CurrencyRates.Extensions;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Core.Constants;
using HomeBudget.Core.Extensions;
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
                 .RegisterCoreIoCDependency()
                 .RegisterCurrencyRatedIoCDependency()
                 .RegistryDapperIoCDependencies();

            var serviceProvider = services.BuildServiceProvider();

            var databaseOptions = serviceProvider.GetRequiredService<IOptions<DatabaseOptions>>().Value;
            var configSettingsProvider = serviceProvider.GetRequiredService<IConfigSettingsProvider>();
            var configSetting = await configSettingsProvider.GetDefaultSettingsAsync();
            var redisConnectionMultiplexer = await ConnectionMultiplexer.ConnectAsync(databaseOptions.RedisConnectionString);

            services
                .AddSingleton(_ => configSetting)
                .AddSingleton(_ => redisConnectionMultiplexer)
                .AddScoped(sp => sp.GetRequiredService<ConnectionMultiplexer>().GetDatabase());

            return services;
        }
    }
}
