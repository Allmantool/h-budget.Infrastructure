using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;
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
        public async Task<Result<int>> SaveRatesAsync([FromBody] CurrencySaveRatesRequest saveRatesRequest)
        {
            var unifiedCurrencyRates = _mapper
                .Map<IReadOnlyCollection<CurrencyRate>>(saveRatesRequest.CurrencyRates);

            return await _currencyRatesService.SaveTodayRatesIfNotExistAsync(unifiedCurrencyRates);
        }

        [HttpGet]
        public async Task<Result<IReadOnlyCollection<CurrencyRate>>> GetRatesAsync()
        {
            return await _redisCacheService.CacheWrappedMethodAsync(
                $"{CacheKeyPrefix}|{nameof(GetRatesAsync)}|{DateTime.Today}",
                () => _currencyRatesService.GetRatesAsync());
        }

        [HttpGet("/currencyRates/today")]
        public async Task<Result<IReadOnlyCollection<CurrencyRate>>> GetTodayRatesAsync()
        {
            return await _redisCacheService.CacheWrappedMethodAsync(
                $"{CacheKeyPrefix}|{nameof(GetTodayRatesAsync)}|{DateTime.Today}",
                () => _currencyRatesService.GetTodayRatesAsync());
        }
    }
}
