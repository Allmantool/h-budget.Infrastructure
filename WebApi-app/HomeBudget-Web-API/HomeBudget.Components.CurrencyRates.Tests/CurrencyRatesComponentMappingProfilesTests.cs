using AutoMapper;
using NUnit.Framework;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget_Web_API.MapperProfileConfigurations;
using Api = HomeBudget_Web_API.Models;

namespace HomeBudget.Components.CurrencyRates.Tests
{
    public class Tests
    {
        private readonly MapperConfiguration _mapperConfiguration = new(x
            => x.AddMaps(ApiCallMappingProfiles.GetExecutingAssembly()));

        private IMapper _mapper;


        [SetUp]
        public void Setup()
        {
            _mapper = _mapperConfiguration.CreateMapper();
        }

        [Test]
        public void Test1()
        {
            // Arrange.


            // Act.
            var result = _mapper.Map<CurrencyRate>(new Api.CurrencyRate
            {
                Id = 1
            });

            // Assert.

            Assert.Pass();
        }
    }
}