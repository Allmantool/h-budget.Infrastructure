using Microsoft.Extensions.DependencyInjection;
using HomeBudget.Components.CurrencyRates.Providers;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Components.CurrencyRates.Services;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;

namespace HomeBudget.Components.CurrencyRates.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection RegisterCurrencyRatedIoCDependency(this IServiceCollection services)
            => services
                .AddScoped<ICurrencyRatesWriteProvider, CurrencyRatesWriteProvider>()
                .AddScoped<ICurrencyRatesReadProvider, CurrencyRatesReadProvider>()
                .AddScoped<ICurrencyRatesService, CurrencyRatesService>();
    }
}
