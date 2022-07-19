using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Moq;
using NUnit.Framework;

using HomeBudget.Components.CurrencyRates.Constants;
using HomeBudget.Components.CurrencyRates.MapperProfileConfigurations;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Models.Api;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Components.CurrencyRates.Services;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;

namespace HomeBudget.Components.CurrencyRates.Tests
{
    [TestFixture]
    public class CurrencyRatesServiceTests
    {
        private readonly Mock<INationalBankApiClient> _nationalBankApiClientMock = new ();
        private readonly Mock<ICurrencyRatesReadProvider> _currencyRatesReadProviderMock = new ();
        private readonly Mock<ICurrencyRatesWriteProvider> _currencyRatesWriteProviderMock = new ();

        private CurrencyRatesService _sut;

        [SetUp]
        public void Setup()
        {
            _sut = new CurrencyRatesService(
                GetDefaultMapper(),
                null,
                _nationalBankApiClientMock.Object,
                _currencyRatesReadProviderMock.Object,
                _currencyRatesWriteProviderMock.Object);
        }

        [Test]
        public async Task GetTodayRatesForPeriodAsync_When_Result()
        {
            const int expectedRatesCount = 4;

            var testStartDate = new DateTime(2021, 3, 2);
            var testEndDate = new DateTime(2021, 8, 2);

            var config = new ConfigSettings
            {
                ActiveNationalBankCurrencies = new[]
                {
                    new ConfigCurrency
                    {
                        Abbreviation = "Abb-A",
                    },
                    new ConfigCurrency
                    {
                        Abbreviation = "Abb-B",
                    }
                }
            };

            _nationalBankApiClientMock
                .Setup(i => i.GetTodayRatesAsync())
                .ReturnsAsync(new[]
                {
                    new NationalBankCurrencyRate
                    {
                        CurrencyId = 1,
                        Abbreviation = "Abb-A",
                        Name = "Name-A",
                        OfficialRate = 1.2m,
                        Scale = 1
                    },
                    new NationalBankCurrencyRate
                    {
                        CurrencyId = 2,
                        Abbreviation = "Abb-B",
                        Name = "Name-B",
                        OfficialRate = 1.6m,
                        Scale = 1
                    },
                });

            _nationalBankApiClientMock
                .Setup(i => i.GetRatesForPeriodAsync(
                    1,
                    testStartDate.ToString(DateFormats.NationalBankExternalApi),
                    testEndDate.ToString(DateFormats.NationalBankExternalApi)))
                .ReturnsAsync(new List<NationalBankShortCurrencyRate>
                {
                    new ()
                    {
                        CurrencyId = 1,
                        OfficialRate = 2.1m
                    },
                    new ()
                    {
                        CurrencyId = 1,
                        OfficialRate = 4.1m
                    },
                });

            _nationalBankApiClientMock
                .Setup(i => i.GetRatesForPeriodAsync(
                    2,
                    testStartDate.ToString(DateFormats.NationalBankExternalApi),
                    testEndDate.ToString(DateFormats.NationalBankExternalApi)))
                .ReturnsAsync(new List<NationalBankShortCurrencyRate>
                {
                    new ()
                    {
                        CurrencyId = 2,
                        OfficialRate = 2.1m
                    },
                    new ()
                    {
                        CurrencyId = 2,
                        OfficialRate = 4.1m
                    },
                });

            _sut = new CurrencyRatesService(
                GetDefaultMapper(),
                config,
                _nationalBankApiClientMock.Object,
                _currencyRatesReadProviderMock.Object,
                _currencyRatesWriteProviderMock.Object);

            var rates = await _sut.GetTodayRatesForPeriodAsync(testStartDate, testEndDate);

            Assert.AreEqual(expectedRatesCount, rates.Payload.Count);
        }

        private static IMapper GetDefaultMapper()
        {
            return new Mapper(new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<CurrencyRateProfiler>();
            }));
        }
    }
}
