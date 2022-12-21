using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using AutoMapper;
using Moq;
using Microsoft.Extensions.Logging;
using NUnit.Framework;

using HomeBudget.Components.CurrencyRates.Services.Interfaces;
using HomeBudget.Core.Services.Interfaces;
using HomeBudget_Web_API.Controllers;
using HomeBudget_Web_API.Models;
using HomeBudget.Core.Models;
using HomeBudget.Components.CurrencyRates.Models;

namespace HomeBudget.Components.CurrencyRates.Tests
{
    [TestFixture]
    public class CurrencyRatesControllerTests
    {
        private CurrencyRatesController _sut;

        private Mock<ILogger<CurrencyRatesController>> _mockLogger;
        private Mock<IMapper> _mockMapper;
        private Mock<IRedisCacheService> _mockRedisCacheService;
        private Mock<ICurrencyRatesService> _mockCurrencyRatesService;

        [SetUp]
        public void SetUp()
        {
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<CurrencyRatesController>>();
            _mockRedisCacheService = new Mock<IRedisCacheService>();

            _mockCurrencyRatesService = new Mock<ICurrencyRatesService>();

            _sut = new CurrencyRatesController(
                _mockLogger.Object,
                _mockMapper.Object,
                _mockRedisCacheService.Object,
                _mockCurrencyRatesService.Object);
        }

        [Test]
        public async Task GetTodayRatesForPeriodAsync_WhenEnquireRatesForPeriod_ThenTryCacheWithExpectedKey()
        {
            const string expectedCacheKey = "ICurrencyRatesService|GetTodayRatesForPeriodAsync|2022-11-27-2022-12-25";

            var request = new GetCurrencyRatesForPeriodRequest
            {
                StartDate = new DateTime(2022, 11, 27),
                EndDate = new DateTime(2022, 12, 25)
            };

            _ = await _sut.GetTodayRatesForPeriodAsync(request);

            _mockRedisCacheService
                .Verify(
                    s => s.CacheWrappedMethodAsync(
                    expectedCacheKey,
                    It.IsAny<Func<Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>>>>()),
                    Times.Once);
        }
    }
}
