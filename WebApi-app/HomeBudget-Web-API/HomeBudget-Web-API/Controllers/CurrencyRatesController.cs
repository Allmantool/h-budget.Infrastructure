using System.Collections.Generic;
using System.Threading.Tasks;

using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using MediatR;

using HomeBudget.Components.CurrencyRates.CQRS.Commands.Models;
using HomeBudget.Components.CurrencyRates.CQRS.Queries.Models;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Core.Models;
using HomeBudget_Web_API.Models;

using CurrencyRate = HomeBudget.Components.CurrencyRates.Models.CurrencyRate;

namespace HomeBudget_Web_API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CurrencyRatesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;

        public CurrencyRatesController(
            IMediator mediator,
            IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<Result<Unit>> SaveRatesAsync([FromBody] CurrencySaveRatesRequest request)
        {
            var unifiedCurrencyRates = _mapper
                .Map<IReadOnlyCollection<CurrencyRate>>(request.CurrencyRates);

            return new Result<Unit>(await _mediator.Send(new SaveCurrencyRatesCommand(unifiedCurrencyRates)));
        }

        [HttpPost("/currencyRates/period")]
        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesForPeriodAsync(
            [FromBody] GetCurrencyRatesForPeriodRequest request)
        {
            return await _mediator.Send(new GetCurrencyGroupedRatesForPeriodQuery
            {
                StartDate = request.StartDate,
                EndDate = request.EndDate,
            });
        }

        [HttpGet]
        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetAllRatesAsync()
            => await _mediator.Send(new GetAllRatesQuery());

        [HttpGet("/currencyRates/today")]
        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesAsync()
            => await _mediator.Send(new GetTodayRatesQuery());
    }
}
