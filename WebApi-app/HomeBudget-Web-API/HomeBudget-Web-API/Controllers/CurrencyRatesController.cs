using System.Collections.Generic;
using System.Threading;
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
        public async Task<Result<int>> SaveRatesAsync([FromBody] CurrencySaveRatesRequest request, CancellationToken token = default)
        {
            var unifiedCurrencyRates = _mapper
                .Map<IReadOnlyCollection<CurrencyRate>>(request.CurrencyRates);

            return await _mediator.Send(new SaveCurrencyRatesCommand(unifiedCurrencyRates), token);
        }

        [HttpPost("/currencyRates/period")]
        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesForPeriodAsync(
            [FromBody] GetCurrencyRatesForPeriodRequest request, CancellationToken token = default)
            => await _mediator.Send(
                new GetCurrencyGroupedRatesForPeriodQuery
                {
                    StartDate = request.StartDate,
                    EndDate = request.EndDate
                },
                token);

        [HttpGet]
        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetAllRatesAsync(CancellationToken token = default)
            => await _mediator.Send(new GetAllRatesQuery(), token);

        [HttpGet("/currencyRates/today")]
        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesAsync(CancellationToken token = default)
            => await _mediator.Send(new GetTodayRatesQuery(), token);
    }
}
