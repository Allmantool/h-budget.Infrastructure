using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;
using HomeBudget.Core.Models;
using HomeBudget_Web_API.Models;
using CurrencyRate = HomeBudget.Components.CurrencyRates.Models.CurrencyRate;

namespace HomeBudget_Web_API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CurrencyRatesController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ICurrencyRatesService _currencyRatesService;

        public CurrencyRatesController(
            IMapper mapper,
            ICurrencyRatesService currencyRatesService)
        {
            _mapper = mapper;
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
            return await _currencyRatesService.GetRatesAsync();
        }

        [HttpGet("/currencyRates/today")]
        public async Task<Result<IReadOnlyCollection<CurrencyRate>>> GetTodayRatesAsync()
        {
            return await _currencyRatesService.GetTodayRatesAsync();
        }
    }
}
