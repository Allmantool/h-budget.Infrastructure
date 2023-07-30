using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;

using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.Components.CurrencyRates.Providers
{
    public class CurrencyRatesWriteProvider : ICurrencyRatesWriteProvider
    {
        private const int MaxRatePerAnOperation = 300;

        private readonly IBaseWriteRepository _writeRepository;

        public CurrencyRatesWriteProvider(IBaseWriteRepository writeRepository) => _writeRepository = writeRepository;

        public async Task<int> UpsertRatesWithSaveAsync(IReadOnlyCollection<CurrencyRate> rates)
        {
            using var upsertTransaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            var affectedRowsPerRequests = await UpsertRatesRequestAsync(rates).ToListAsync();

            upsertTransaction.Complete();

            return affectedRowsPerRequests.Sum();
        }

        private async IAsyncEnumerable<int> UpsertRatesRequestAsync(IEnumerable<CurrencyRate> rates)
        {
            const string insertQuery = "INSERT INTO dbo.[CurrencyRates] " +
                                       "       ([CurrencyId], [Name], [Abbreviation], [Scale], [OfficialRate], [RatePerUnit], [UpdateDate]) " +
                                       "VALUES (@CurrencyId, @Name, @Abbreviation, @Scale, @OfficialRate, @RatePerUnit, @UpdateDate);";

            const string deleteQuery = "DELETE " +
                                       "  FROM dbo.[CurrencyRates] " +
                                       " WHERE [CurrencyId] IN @CurrencyIds AND [UpdateDate] IN @UpdateDates;";

            foreach (var ratesPerAnChunk in rates.Chunk(MaxRatePerAnOperation))
            {
                await _writeRepository.ExecuteAsync(
                    deleteQuery,
                    new
                    {
                        CurrencyIds = ratesPerAnChunk.Select(r => r.CurrencyId),
                        UpdateDates = ratesPerAnChunk.Select(r => r.UpdateDate)
                    });

                yield return await _writeRepository.ExecuteAsync(insertQuery, ratesPerAnChunk);
            }
        }
    }
}
