using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using AutoMapper;

using HomeBudget.Components.CurrencyRates.Extensions;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Components.CurrencyRates.Services.Interfaces;
using HomeBudget.Core.Constants;
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

        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetRatesAsync()
        {
            var rates = await _currencyRatesReadProvider.GetRatesAsync();

            var groupedCurrencyRates = rates.MapToCurrencyRateGrouped(_mapper);

            return Succeeded(groupedCurrencyRates);
        }

        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesForPeriodAsync(DateTime startDate, DateTime endDate)
        {
            var todayRatesResponse = await GetTodayRatesAsync();

            var tasks = todayRatesResponse.Payload.Select(rate => _nationalBankApiClient
                .GetRatesForPeriodAsync(
                    rate.CurrencyId,
                    startDate.ToString(DateFormats.NationalBankExternalApi),
                    endDate.ToString(DateFormats.NationalBankExternalApi)));

            var shortRatesGroups = await Task.WhenAll(tasks);
            var shortRates = shortRatesGroups.SelectMany(i => i);
            var ratesFromApiCall = _mapper.Map<IReadOnlyCollection<CurrencyRate>>(shortRates);

            foreach (var rate in ratesFromApiCall)
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

            await SaveIfNotExistAsync(() => _currencyRatesReadProvider.GetRatesForPeriodAsync(startDate, endDate), ratesFromApiCall);

            return Succeeded(ratesFromApiCall.MapToCurrencyRateGrouped(_mapper));
        }

        public async Task<Result<IReadOnlyCollection<CurrencyRateGrouped>>> GetTodayRatesAsync()
        {
            var activeCurrencyAbbreviations = _configSettings
                .ActiveNationalBankCurrencies
                .Select(i => i.Abbreviation);

            var todayRatesFromApi = await _nationalBankApiClient.GetTodayRatesAsync();
            var activeCurrencyRates = todayRatesFromApi
                .Where(r => activeCurrencyAbbreviations.Contains(r.Abbreviation, StringComparer.OrdinalIgnoreCase));

            var ratesFromApiCall = _mapper.Map<IReadOnlyCollection<CurrencyRate>>(activeCurrencyRates);

            await SaveIfNotExistAsync(() => _currencyRatesReadProvider.GetTodayRatesAsync(), ratesFromApiCall);

            return Succeeded(ratesFromApiCall.MapToCurrencyRateGrouped(_mapper));
        }

        public async Task<Result<int>> SaveIfNotExistAsync(
            Func<Task<IReadOnlyCollection<CurrencyRate>>> enquireCurrencyRatesAction,
            IReadOnlyCollection<CurrencyRate> ratesFromApiCall = null)
        {
            ratesFromApiCall ??= Enumerable.Empty<CurrencyRate>().ToList();

            var ratesFromDatabase = await enquireCurrencyRatesAction();
            var amountOfAffectedRows = ratesFromDatabase.IsNullOrEmpty() || ratesFromDatabase.Count != ratesFromApiCall.Count
                ? await _currencyRatesWriteProvider.SaveRatesAsync(ratesFromApiCall)
                : default;

            return Succeeded(amountOfAffectedRows);
        }
    }
}
