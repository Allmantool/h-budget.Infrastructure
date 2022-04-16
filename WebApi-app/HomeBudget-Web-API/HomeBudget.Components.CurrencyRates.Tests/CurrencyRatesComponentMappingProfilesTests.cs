using AutoMapper;
using NUnit.Framework;
using HomeBudget_Web_API.MapperProfileConfigurations;

namespace HomeBudget.Components.CurrencyRates.Tests
{
    public class Tests
    {
        private readonly MapperConfiguration _mapperConfiguration = new (x
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
            // Assert.
            Assert.Pass();
        }
    }
}