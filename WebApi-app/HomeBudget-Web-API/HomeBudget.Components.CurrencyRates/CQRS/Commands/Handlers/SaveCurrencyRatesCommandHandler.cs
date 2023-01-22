using System.Threading;
using System.Threading.Tasks;

using MediatR;

using HomeBudget.Components.CurrencyRates.CQRS.Commands.Models;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;
using HomeBudget.Core.Services.Interfaces;

namespace HomeBudget.Components.CurrencyRates.CQRS.Commands.Handlers
{
    internal class SaveCurrencyRatesCommandHandler : IRequestHandler<SaveCurrencyRatesCommand, Unit>
    {
        private readonly ICurrencyRatesService _currencyRatesService;
        private readonly IRedisCacheService _redisCacheService;

        public SaveCurrencyRatesCommandHandler(ICurrencyRatesService currencyRatesService, IRedisCacheService redisCacheService)
        {
            _currencyRatesService = currencyRatesService;
            _redisCacheService = redisCacheService;
        }

        public async Task<Unit> Handle(SaveCurrencyRatesCommand request, CancellationToken cancellationToken)
        {
            await _currencyRatesService.SaveWithRewriteAsync(request);

            await _redisCacheService.FlushDatabaseAsync();

            return Unit.Value;
        }
    }
}
