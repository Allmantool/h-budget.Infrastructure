using System.Net;

using NUnit.Framework;
using RestSharp;

using HomeBudget.Core.Models;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget_Web_API.Models;

using CurrencyRate = HomeBudget_Web_API.Models.CurrencyRate;

namespace HomeBudget.Components.IntegrationTests
{
    [Ignore("Intend to be used only for local testing. Not appropriate infrastructure has been setup")]
    [TestFixture]
    public class CurrencyRatesControllerTests
        : BaseWebApplicationFactory<HomeBudgetWebApplicationFactory<Program>, Program>
    {
        [SetUp]
        public void SetUp()
        {
            SetUpHttpClient();
        }

        [Test]
        public async Task GetTodayRatesForPeriodAsync_WhenExecuteTheCallToEnquireRatesForPeriodOfTime_ThenIsSuccessStatusCode()
        {
            var requestBody = new GetCurrencyRatesForPeriodRequest
            {
                StartDate = new DateTime(2022, 12, 25),
                EndDate = new DateTime(2022, 12, 25),
            };

            var getCurrencyRatesForPeriodRequest = new RestRequest("/currencyRates/period", Method.Post)
                .AddJsonBody(requestBody);

            var response = await RestHttpClient!.ExecuteAsync<Result<IReadOnlyCollection<CurrencyRateGrouped>>>(getCurrencyRatesForPeriodRequest);

            Assert.IsTrue(response.IsSuccessful);
        }

        [Test]
        public async Task GetTodayRatesForPeriodAsync_WhenExecuteTheCallToEnquireRatesForPeriodOfTime_ThenReturnsExpectedAmountOfRecordsInResponse()
        {
            var requestBody = new GetCurrencyRatesForPeriodRequest
            {
                StartDate = new DateTime(2022, 12, 25),
                EndDate = new DateTime(2022, 12, 25),
            };

            var getCurrencyRatesForPeriodRequest = new RestRequest("/currencyRates/period", Method.Post)
                .AddJsonBody(requestBody);

            var response = await RestHttpClient!.ExecuteAsync<Result<IReadOnlyCollection<CurrencyRateGrouped>>>(getCurrencyRatesForPeriodRequest);
            var payload = response.Data;

            Assert.AreEqual(6, payload.Payload.Count);
        }

        [Test]
        public async Task GetAllRatesAsync_WhenTodayCurrencyHasNotBeenSaved_ThenNotFound()
        {
            var getRatesRequest = new RestRequest("/currencyRates");

            var response = await RestHttpClient!.ExecuteAsync<Result<IReadOnlyCollection<CurrencyRateGrouped>>>(getRatesRequest);

            // TODO: think over what to test
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [Test]
        public async Task GetTodayRatesAsync_WhenEnquireAndSaveTodayRates_ThenOkAsStatus()
        {
            var getTodayRatesRequest = new RestRequest("/currencyRates/today");

            var response = await RestHttpClient!.ExecuteAsync<Result<IReadOnlyCollection<CurrencyRateGrouped>>>(getTodayRatesRequest);

            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [Test]
        public async Task SaveRatesAsync_WhenTryToSaveAlreadyExistedValue_ThenOk()
        {
            var requestBody = new CurrencySaveRatesRequest
            {
                CurrencyRates = new List<CurrencyRate>
                {
                    new()
                    {
                        Scale = 1,
                        Abbreviation = "USD",
                        CurrencyId = 431,
                        Name = "Доллар США",
                        OfficialRate = 2.7286m,
                        RatePerUnit = 2.7286m,
                        UpdateDate = new DateTime(2023, 1, 8)
                    }
                }
            };

            var currencySaveRatesRequest = new RestRequest("/currencyRates", Method.Post)
                .AddJsonBody(requestBody);

            var response = await RestHttpClient!.ExecuteAsync<Result<int>>(currencySaveRatesRequest);

            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }
    }
}
