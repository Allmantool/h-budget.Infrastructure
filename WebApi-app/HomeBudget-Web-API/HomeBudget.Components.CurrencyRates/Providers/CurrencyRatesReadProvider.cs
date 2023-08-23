using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.Core.Constants;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.Components.CurrencyRates.Providers
{
    internal class CurrencyRatesReadProvider : ICurrencyRatesReadProvider
    {
        private readonly string _ratesAbbreviationPredicate;
        private readonly IBaseReadRepository _readRepository;

        public CurrencyRatesReadProvider(
            ConfigSettings configSettings,
            IBaseReadRepository readRepository)
        {
            var abbreviations = string.Join(',', configSettings.ActiveNationalBankCurrencies
                .Select(i => $"'{i.Abbreviation}'"));

            _readRepository = readRepository;
            _ratesAbbreviationPredicate = $"[Abbreviation] IN ({abbreviations})";
        }

        public Task<IReadOnlyCollection<CurrencyRate>> GetRatesForPeriodAsync(DateOnly startDate, DateOnly endDate)
        {
            var query = "SELECT * " +
                          "FROM [CurrencyRates] WITH (NOLOCK) " +
                         "WHERE [UpdateDate] BETWEEN @StartDate AND @EndDate " +
                          $"AND {_ratesAbbreviationPredicate};";

            return _readRepository.GetAsync<CurrencyRate>(
                query,
                new
                {
                    StartDate = startDate.ToString(DateFormats.MsSqlDayOnlyFormat),
                    EndDate = endDate.ToString(DateFormats.MsSqlDayOnlyFormat)
                });
        }

        public Task<IReadOnlyCollection<CurrencyRate>> GetRatesAsync()
        {
            var query = "SELECT * " +
                          "FROM [CurrencyRates] WITH (NOLOCK) " +
                        $"WHERE {_ratesAbbreviationPredicate};";

            return _readRepository.GetAsync<CurrencyRate>(query);
        }

        public Task<IReadOnlyCollection<CurrencyRate>> GetTodayRatesAsync()
        {
            var query = "SELECT * " +
                          "FROM [CurrencyRates] WITH (NOLOCK) " +
                         "WHERE [UpdateDate] = @Today " +
                          $"AND {_ratesAbbreviationPredicate};";

            return _readRepository.GetAsync<CurrencyRate>(
                query,
                new
                {
                    Today = DateOnly.FromDateTime(DateTime.Now).ToString(DateFormats.MsSqlDayOnlyFormat)
                });
        }
    }
}
