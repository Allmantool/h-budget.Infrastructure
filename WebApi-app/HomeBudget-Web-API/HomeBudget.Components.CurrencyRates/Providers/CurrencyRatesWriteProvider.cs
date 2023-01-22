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
        private readonly IBaseWriteRepository _writeRepository;

        public CurrencyRatesWriteProvider(IBaseWriteRepository writeRepository) => _writeRepository = writeRepository;

        public async Task<int> UpsertRatesSaveAsync(IReadOnlyCollection<CurrencyRate> rates)
        {
            const string insertQuery = "INSERT INTO dbo.[CurrencyRates] " +
                                       "([CurrencyId], [Name], [Abbreviation], [Scale], [OfficialRate], [RatePerUnit], [UpdateDate]) " +
                                       "VALUES (@CurrencyId, @Name, @Abbreviation, @Scale, @OfficialRate, @RatePerUnit, @UpdateDate);";

            const string deleteQuery = "DELETE " +
                                       "FROM dbo.[CurrencyRates] " +
                                       "WHERE CurrencyId IN @CurrencyIds AND UpdateDate IN @UpdateDates";

            using var upsertTransaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            await _writeRepository.ExecuteAsync(
                deleteQuery,
                new
                {
                    CurrencyIds = rates.Select(r => r.CurrencyId),
                    UpdateDates = rates.Select(r => r.UpdateDate)
                });

            var insertAffectedRowsAmount = await _writeRepository.ExecuteAsync(insertQuery, rates);

            upsertTransaction.Complete();

            return insertAffectedRowsAmount;
        }
    }
}
