using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HomeBudget.Components.CurrencyRates.Constants;
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

        public async Task<Result<IReadOnlyCollection<CurrencyRate>>> GetTodayRatesForPeriodAsync(DateTime startDate, DateTime endDate)
        {
            var todayRatesResponse = await GetTodayRatesAsync();

            var tasks = todayRatesResponse.Payload.Select(rate => _nationalBankApiClient
                .GetRatesForPeriodAsync(
                    rate.CurrencyId,
                    startDate.ToString(DateFormats.NationalBankExternalApi),
                    endDate.ToString(DateFormats.NationalBankExternalApi)));

            var shortRatesGroups = await Task.WhenAll(tasks);

            var shortRates = shortRatesGroups.SelectMany(i => i);

            var rates = _mapper.Map<IReadOnlyCollection<CurrencyRate>>(shortRates);

            foreach (var rate in rates)
            {
                var configInfo = todayRatesResponse
                    .Payload
                    .SingleOrDefault(i => i.CurrencyId == rate.CurrencyId);

                if (configInfo == null)
                {
                    continue;
                }

                rate.Abbreviation = configInfo.Abbreviation;
                rate.Name = configInfo.Name;
                rate.Scale = configInfo.Scale;
                rate.RatePerUnit = rate.OfficialRate / configInfo.Scale;
            }

            await SaveRatesForPeriodIfNotExistAsync(rates, startDate, endDate);

            return Succeeded(rates);
        }

        public async Task<Result<IReadOnlyCollection<CurrencyRate>>> GetTodayRatesAsync()
        {
            var activeCurrencyAbbreviations = _configSettings.ActiveNationalBankCurrencies.Select(i => i.Abbreviation);
            var todayRates = await _nationalBankApiClient.GetTodayRatesAsync();
            var activeRates = todayRates
                .Where(r => activeCurrencyAbbreviations.Contains(r.Abbreviation, StringComparer.OrdinalIgnoreCase));

            var rates = _mapper.Map<IReadOnlyCollection<CurrencyRate>>(activeRates);

            await SaveTodayRatesIfNotExistAsync(rates);

            return Succeeded(rates);
        }

        public async Task<Result<int>> SaveTodayRatesIfNotExistAsync(IReadOnlyCollection<CurrencyRate> rates)
        {
            var todayRatesFromDatabase = await _currencyRatesReadProvider.GetTodayRatesAsync();
            var amountOfAffectedRows = todayRatesFromDatabase.IsNullOrEmpty()
                ? await _currencyRatesWriteProvider.SaveRatesAsync(rates)
                : default;

            return Succeeded(amountOfAffectedRows);
        }

        public async Task<Result<int>> SaveRatesForPeriodIfNotExistAsync(IReadOnlyCollection<CurrencyRate> rates, DateTime startDate, DateTime endDate)
        {
            var todayRatesFromDatabase = await _currencyRatesReadProvider.GetRatesForPeriodAsync(startDate, endDate);
            var amountOfAffectedRows = todayRatesFromDatabase.IsNullOrEmpty() || (rates.Count != todayRatesFromDatabase.Count)
                ? await _currencyRatesWriteProvider.SaveRatesAsync(rates)
                : default;

            return Succeeded(amountOfAffectedRows);
        }
    }
}
