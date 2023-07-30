﻿using System;
using System.Threading.Tasks;

using AutoMapper;
using Moq;
using MediatR;
using NUnit.Framework;

using HomeBudget_Web_API.Controllers;
using HomeBudget_Web_API.Models;
using HomeBudget.Components.CurrencyRates.CQRS.Queries.Models;

namespace HomeBudget.Components.CurrencyRates.Tests
{
    [TestFixture]
    public class CurrencyRatesControllerTests
    {
        private CurrencyRatesController _sut;

        private Mock<IMapper> _mockMapper;
        private Mock<IMediator> _mockMediator;

        [SetUp]
        public void SetUp()
        {
            _mockMapper = new Mock<IMapper>();
            _mockMediator = new Mock<IMediator>();

            _sut = new CurrencyRatesController(
                _mockMediator.Object,
                _mockMapper.Object);
        }

        [Test]
        public async Task GetRatesForPeriodAsync_WhenEnquiriedRatesForPeriod_ThenSendExpectedTypeOfQuery()
        {
            var request = new GetCurrencyRatesForPeriodRequest
            {
                StartDate = new DateTime(2022, 11, 27),
                EndDate = new DateTime(2022, 12, 25)
            };

            _ = await _sut.GetRatesForPeriodAsync(request.StartDate, request.EndDate);

            _mockMediator.Verify(s => s.Send(It.IsAny<GetCurrencyGroupedRatesForPeriodQuery>(), default), Times.Once);
        }
    }
}
