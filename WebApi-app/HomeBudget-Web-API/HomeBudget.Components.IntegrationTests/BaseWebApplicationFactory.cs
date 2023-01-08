using Microsoft.AspNetCore.Mvc.Testing;
using RestSharp;

namespace HomeBudget.Components.IntegrationTests
{
    public abstract class BaseWebApplicationFactory<TWebFactory, TEntryPoint> : IDisposable
        where TWebFactory : WebApplicationFactory<TEntryPoint>, new()
        where TEntryPoint : class
    {
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
