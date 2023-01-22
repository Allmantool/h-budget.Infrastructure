using Microsoft.Extensions.Configuration;

using HomeBudget_Web_API.Constants;

namespace HomeBudget_Web_API.Extensions
{
    internal static class ConfigurationExtensions
    {
        public static string GetHealthCheckEndpoint(this IConfiguration configuration, string hostUrls)
        {
            var healthCheckHost = configuration.GetRequiredSection("HealthCheckOptions:Host").Value ?? hostUrls;

            return $"{healthCheckHost}{Endpoints.HealthCheckSource}";
        }
    }
}
