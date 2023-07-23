﻿using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

using HomeBudget_Web_API.Constants;
using HomeBudget_Web_API.Extensions;
using HomeBudget_Web_API.Middlewares;

namespace HomeBudget_Web_API.Configuration
{
    internal static class HealthCheckConfiguration
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
                    setup.AddHealthCheckEndpoint("[Currency rates endpoint]", configuration.GetHealthCheckEndpoint(hostUrls));
                })
                .AddInMemoryStorage();

            return services;
        }

        public static IApplicationBuilder SetUpHealthCheckEndpoints(this IApplicationBuilder builder)
        {
            return builder.UseEndpoints(config =>
            {
                config.MapHealthChecks(Endpoints.HealthCheckSource, new HealthCheckOptions
                {
                    Predicate = _ => true,
                    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
                });

                config.MapHealthChecksUI(options =>
                {
                    options.UIPath = "/show-health-ui";
                    options.ApiPath = "/health-ui-api";
                });
            });
        }
    }
}
