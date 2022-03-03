using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Polly;
using Refit;
using Polly.Extensions.Http;
using HomeBudget.Components.CurrencyRates.Providers;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Components.CurrencyRates.Services;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;

namespace HomeBudget.Components.CurrencyRates.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection RegisterCurrencyRatedIoCDependency(this IServiceCollection services)
        {
            return services
                .AddScoped<IConfigSettingsProvider, ConfigSettingsProvider>()
                .AddScoped<ICurrencyRatesWriteProvider, CurrencyRatesWriteProvider>()
                .AddScoped<ICurrencyRatesReadProvider, CurrencyRatesReadProvider>()
                .AddScoped<ICurrencyRatesService, CurrencyRatesService>()
                .RegisterNationalApiHttpClient();
        }

        private static IServiceCollection RegisterNationalApiHttpClient(this IServiceCollection services)
        {
            services
                .AddRefitClient<INationalBankApiClient>(_ => GetRefitSettings())
                .ConfigureHttpClient(httpClient =>
                {
                    httpClient.BaseAddress = new Uri("https://www.nbrb.by");
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                })
                .AddPolicyHandler(GetRetryPolicy())
                .SetHandlerLifetime(TimeSpan.FromMinutes(15));

            return services;
        }

        private static RefitSettings GetRefitSettings()
        {
            return new RefitSettings
            {
                CollectionFormat = CollectionFormat.Multi,
                ContentSerializer = GetHttpContentSerializer(),
                HttpMessageHandlerFactory = () => new HttpClientHandler
                {
                    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
                }
            };
        }

        private static IHttpContentSerializer GetHttpContentSerializer()
        {
            var serializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                Formatting = Formatting.Indented,
            };

            return new NewtonsoftJsonContentSerializer(serializerSettings);
        }

        private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .OrResult(msg => msg.StatusCode == HttpStatusCode.NotFound)
                .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
        }
    }
}
