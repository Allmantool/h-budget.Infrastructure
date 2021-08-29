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

        public Task<int> SaveRatesAsync(IEnumerable<CurrencyRate> rates)
        {
            const string query = "INSERT INTO dbo.[CurrencyRates] " +
                                        "([CurencyId], [Name], [Abbreviation], [Scale], [OfficialRate], [RatePerUnit], [UpdateDate]) " +
                                 "VALUES (@CurencyId, @Name, @Abbreviation, @Scale, @OfficialRate, @RatePerUnit, @UpdateDate);";

            // TODO: Apply mapper there, each layer have it's own model/dto

            return _writeRepository.SaveAsync(query, rates);
        }
    }
}
