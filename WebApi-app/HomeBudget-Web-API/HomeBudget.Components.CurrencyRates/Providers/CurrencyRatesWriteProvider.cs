using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Components.CurrencyRates.Providers.Interfaces;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.Components.CurrencyRates.Providers
{
    public class CurrencyRatesWriteProvider : ICurrencyRatesWriteProvider
    {
        private readonly IBaseWriteRepository _writeRepository;

        public CurrencyRatesWriteProvider(IBaseWriteRepository writeRepository) => _writeRepository = writeRepository;

        public Task<int> SaveRatesAsync(IReadOnlyCollection<CurrencyRate> rates)
        {
            const string query = "INSERT INTO dbo.[CurrencyRates] " +
                                        "([CurrencyId], [Name], [Abbreviation], [Scale], [OfficialRate], [RatePerUnit], [UpdateDate]) " +
                                 "VALUES (@CurrencyId, @Name, @Abbreviation, @Scale, @OfficialRate, @RatePerUnit, @UpdateDate);";

            // TODO: Apply mapper there, each layer have it's own model/dto
            return _writeRepository.SaveAsync(query, rates);
        }
    }
}
