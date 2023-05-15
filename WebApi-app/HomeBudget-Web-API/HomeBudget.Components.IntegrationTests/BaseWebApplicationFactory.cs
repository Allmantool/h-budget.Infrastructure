﻿using HomeBudget_Web_API.Constants;
using Microsoft.AspNetCore.Mvc.Testing;
using NUnit.Framework;
using RestSharp;

namespace HomeBudget.Components.IntegrationTests
{
    public abstract class BaseWebApplicationFactory<TWebFactory, TEntryPoint> : IDisposable
        where TWebFactory : WebApplicationFactory<TEntryPoint>, new()
        where TEntryPoint : class
    {
        protected const string CategoryToExclude = "Integration";

        protected BaseWebApplicationFactory()
        {
            SetUpHttpClient();
        }

        protected RestClient? RestHttpClient { get; private set; }

        protected void SetUpHttpClient()
        {
            var webAppFactory = new TWebFactory();
            var httpClient = webAppFactory.CreateClient();

            RestHttpClient = new RestClient(httpClient, new RestClientOptions(new Uri("http://localhost")));
        }

        private bool _disposed;

        [SetUp]
        public virtual void SetUp()
        {
            var activeEnvironment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            var testCategories = TestContext.CurrentContext.Test.Properties["Category"];

            if (HostEnvironments.Docker.Equals(activeEnvironment, StringComparison.OrdinalIgnoreCase) && testCategories.Contains(CategoryToExclude))
            {
                Assert.Inconclusive($"Cannot run this type of test on environment: {activeEnvironment}");
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (_disposed)
            {
                return;
            }

            if (disposing)
            {
                RestHttpClient?.Dispose();
            }

            _disposed = true;
        }
    }
}
