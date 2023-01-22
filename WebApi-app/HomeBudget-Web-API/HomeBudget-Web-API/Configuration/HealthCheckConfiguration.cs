using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

using HomeBudget_Web_API.Extensions;
using HomeBudget_Web_API.Middlewares;

namespace HomeBudget_Web_API.Configuration
{
    public static class HealthCheckConfiguration
    {
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
