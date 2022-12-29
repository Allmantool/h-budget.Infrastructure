﻿using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Polly;
using Refit;
using Polly.Extensions.Http;

using HomeBudget.Components.CurrencyRates.Providers;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Components.CurrencyRates.Services;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;
using HomeBudget.Core.Models;

namespace HomeBudget.Components.CurrencyRates.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection RegisterCurrencyRatedIoCDependency(
            this IServiceCollection services)
        {
            var serviceProvider = services.BuildServiceProvider();

            return services
                .AddScoped<IConfigSettingsProvider, ConfigSettingsProvider>()
                .AddScoped<IConfigSettingsServices, ConfigSettingsServices>()
                .AddScoped<ICurrencyRatesWriteProvider, CurrencyRatesWriteProvider>()
                .AddScoped<ICurrencyRatesReadProvider, CurrencyRatesReadProvider>()
                .AddScoped<ICurrencyRatesService, CurrencyRatesService>()
                .RegisterNationalApiHttpClient(serviceProvider);
        }

        private static IServiceCollection RegisterNationalApiHttpClient(
            this IServiceCollection services,
            IServiceProvider serviceProvider)
        {
            var externalResourceUrls = serviceProvider.GetRequiredService<IOptions<ExternalResourceUrls>>().Value;

            services
                .AddRefitClient<INationalBankApiClient>(_ => GetRefitSettings())
                .ConfigureHttpClient(httpClient =>
                {
                    httpClient.BaseAddress = externalResourceUrls.NationalBankUrl;
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                })
                .AddPolicyHandler(GetRetryPolicy(serviceProvider))
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
                ContractResolver = new CamelCasePropertyNamesContractResolver
                {
                    NamingStrategy = new SnakeCaseNamingStrategy()
                },
                Formatting = Formatting.Indented,
            };

            return new NewtonsoftJsonContentSerializer(serializerSettings);
        }

        private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy(IServiceProvider serviceProvider)
        {
            var pollyRetryOptions = serviceProvider.GetRequiredService<IOptions<PollyRetryOptions>>().Value;

            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .OrResult(msg => msg.StatusCode == HttpStatusCode.NotFound)
                .WaitAndRetryAsync(
                    pollyRetryOptions.RetryCount,
                    retryAttempt => TimeSpan.FromSeconds(Math.Pow(pollyRetryOptions.SleepDurationInSeconds, retryAttempt)));
        }
    }
}
