using Microsoft.Extensions.Configuration;

namespace HomeBudget_Web_API.Extensions
{
    public static class ConfigurationExtensions
    {
        public static string GetHealthCheckEndpoint(this IConfiguration configuration)
        {
            var healthCheckHost = configuration.GetRequiredSection("HealthCheckOptions:Host").Value;

            return $"{healthCheckHost}/health";
        }
    }
}
