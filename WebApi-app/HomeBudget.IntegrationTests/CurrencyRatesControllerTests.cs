using Microsoft.AspNetCore.Hosting;
using NUnit.Framework;

namespace HomeBudget.IntegrationTests
{
    [TestFixture]
    public class CurrencyRatesControllerTests : IClassFixture<HomeBudgetWebApplicationFactory<Startup>>
    {
        [Test]
        public async Task GetTodayRatesForPeriodAsync_When_Then()
        {
            var webAppFactory = new HomeBudgetWebApplicationFactory<Program>();
            var httpClient = webAppFactory.CreateDefaultClient();

            var request = new HttpRequestMessage(HttpMethod.Post, "");

            _ = await httpClient.PostAsync("", request);
        }
    }
}
