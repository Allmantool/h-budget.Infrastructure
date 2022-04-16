using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;
using HomeBudget.Core.Extensions;
using HomeBudget.Core.Models;
using HomeBudget.Core.Services;

namespace HomeBudget.Components.CurrencyRates.Services
{
    internal class CurrencyRatesService : BaseService, ICurrencyRatesService
    {
        private readonly IMapper _mapper;
        private readonly ConfigSettings _configSettings;
        private readonly INationalBankApiClient _nationalBankApiClient;
        private readonly ICurrencyRatesReadProvider _currencyRatesReadProvider;
        private readonly ICurrencyRatesWriteProvider _currencyRatesWriteProvider;

        public CurrencyRatesService(
            IMapper mapper,
            ConfigSettings configSettings,
            INationalBankApiClient nationalBankApiClient,
            ICurrencyRatesReadProvider currencyRatesReadProvider,
            ICurrencyRatesWriteProvider currencyRatesWriteProvider)
        {
            _mapper = mapper;
            _configSettings = configSettings;
            _nationalBankApiClient = nationalBankApiClient;
            _currencyRatesReadProvider = currencyRatesReadProvider;
            _currencyRatesWriteProvider = currencyRatesWriteProvider;
        }

        public async Task<Result<IReadOnlyCollection<CurrencyRate>>> GetRatesAsync()
            => Succeeded(await _currencyRatesReadProvider.GetRatesAsync());

        public async Task<Result<IReadOnlyCollection<CurrencyRate>>> GetTodayRatesAsync()
        {
            var todayRates = await _nationalBankApiClient.GetTodayRatesAsync();
            var activeRates = todayRates
                .Where(r => _configSettings.ActiveCurrencies.Contains(r.Abbreviation, StringComparer.OrdinalIgnoreCase));

            var rates = _mapper.Map<IReadOnlyCollection<CurrencyRate>>(activeRates);

            await SaveTodayRatesIfNotExistAsync(rates);

            return Succeeded(rates);
        }

        public async Task<Result<int>> SaveTodayRatesIfNotExistAsync(IEnumerable<CurrencyRate> rates)
        {
            var todayRatesFromDatabase = await _currencyRatesReadProvider.GetTodayRatesAsync();
            var amountOfAffectedRows = todayRatesFromDatabase.IsNullOrEmpty()
                ? await _currencyRatesWriteProvider.SaveRatesAsync(rates)
                : default;

            return Succeeded(amountOfAffectedRows);
        }
    }
}
