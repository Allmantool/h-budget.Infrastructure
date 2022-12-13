using System.Text;
using NUnit.Framework;

namespace HomeBudget.Components.IntegrationTests
{
    [TestFixture]
    public class CurrencyRatesControllerTests
    {
        [Test]
        [Ignore("Intend to be used only for local testing. Not appropriate infrastructure has been setup")]
        public async Task GetTodayRatesForPeriodAsync_When_Then()
        {
            var webAppFactory = new HomeBudgetWebApplicationFactory<Program>();
            var httpClient = webAppFactory.CreateClient();

            const string bodyAsJson = "";

            var request = new HttpRequestMessage(HttpMethod.Post, "/currencyRates/period")
            {
                Content = new StringContent(bodyAsJson, Encoding.UTF8, "application/json")
            };

            _ = await httpClient.SendAsync(request);
        }
    }
}
