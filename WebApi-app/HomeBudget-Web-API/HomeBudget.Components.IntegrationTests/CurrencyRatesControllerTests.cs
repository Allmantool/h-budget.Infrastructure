using System.Text;

using Newtonsoft.Json;
using NUnit.Framework;

using HomeBudget_Web_API.Models;

namespace HomeBudget.Components.IntegrationTests
{
    [TestFixture]
    public class CurrencyRatesControllerTests
    {
        [Test]
        [Ignore("Intend to be used only for local testing. Not appropriate infrastructure has been setup")]
        public async Task GetTodayRatesForPeriodAsync_WhenExecuteTheCallToEnquireRatesForPeriodOfTime_ThenIsSuccessStatusCode()
        {
            var webAppFactory = new HomeBudgetWebApplicationFactory<Program>();
            var httpClient = webAppFactory.CreateClient();

            var requestBody = new GetCurrencyRatesForPeriodRequest
            {
                StartDate = new DateTime(2022, 12, 25),
                EndDate = new DateTime(2022, 12, 25),
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "/currencyRates/period")
            {
                Content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json")
            };

            var response = await httpClient.SendAsync(request);

            Assert.IsTrue(response.IsSuccessStatusCode);
        }
    }
}
