using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using AutoMapper;
using Microsoft.AspNetCore.Mvc;

using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;
using HomeBudget.Core.Constants;
using HomeBudget.Core.Models;
using HomeBudget.Core.Services.Interfaces;
using HomeBudget_Web_API.Models;
using CurrencyRate = HomeBudget.Components.CurrencyRates.Models.CurrencyRate;

namespace HomeBudget_Web_API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CurrencyRatesController : ControllerBase
    {
        private const string CacheKeyPrefix = nameof(ICurrencyRatesService);

        private readonly IMapper _mapper;
        private readonly IRedisCacheService _redisCacheService;
        private readonly ICurrencyRatesService _currencyRatesService;

        public CurrencyRatesController(
            IMapper mapper,
            IRedisCacheService redisCacheService,
            ICurrencyRatesService currencyRatesService)
        {
            _mapper = mapper;
            _redisCacheService = redisCacheService;
            _currencyRatesService = currencyRatesService;
        }

        [HttpPost]
        public async Task<Result<int>> SaveRatesAsync([FromBody] CurrencySaveRatesRequest request)
        {
            var unifiedCurrencyRates = _mapper
                .Map<IReadOnlyCollection<CurrencyRate>>(request.CurrencyRates);

            return await _currencyRatesService.SaveIfNotExistAsync(unifiedCurrencyRates);
        }

        [HttpPost("/currencyRates/period")]
        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesForPeriodAsync([FromBody] GetCurrencyRatesForPeriodRequest request)
        {
            var redisCacheKey = $"{CacheKeyPrefix}" +
                                $"|{nameof(GetTodayRatesForPeriodAsync)}" +
                                $"|{request.StartDate.ToString(DateFormats.NationalBankExternalApi)}-{request.EndDate.ToString(DateFormats.NationalBankExternalApi)}";

            return await _redisCacheService.CacheWrappedMethodAsync(
                redisCacheKey,
                () => _currencyRatesService.GetTodayRatesForPeriodAsync(request.StartDate, request.EndDate));
        }

        [HttpGet]
        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetRatesAsync()
        {
            return await _redisCacheService.CacheWrappedMethodAsync(
                $"{CacheKeyPrefix}|{nameof(GetRatesAsync)}|{DateTime.Today}",
                () => _currencyRatesService.GetRatesAsync());
        }

        [HttpGet("/currencyRates/today")]
        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesAsync()
        {
            return await _redisCacheService.CacheWrappedMethodAsync(
                $"{CacheKeyPrefix}|{nameof(GetTodayRatesAsync)}|{DateTime.Today}",
                () => _currencyRatesService.GetTodayRatesAsync());
        }
    }
}
