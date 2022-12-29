using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Dapper;

using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.DataAccess.Dapper.SqlClients.MsSql
{
    public class DapperReadRepository : IBaseReadRepository
    {
        private readonly ISqlConnectionFactory _sqlConnectionFactory;

        public DapperReadRepository(ISqlConnectionFactory sqlConnectionFactory)
        {
            _sqlConnectionFactory = sqlConnectionFactory;
        }

        public async Task<IReadOnlyCollection<T>> GetAsync<T>(string sqlQuery, object parameters)
        {
            using var db = _sqlConnectionFactory.Create();
            var result = await db.QueryAsync<T>(sqlQuery, parameters);

            return result.ToList();
        }

        public async Task<T> SingleAsync<T>(string sqlQuery, object parameters)
        {
            using var db = _sqlConnectionFactory.Create();

            return await db.QuerySingleAsync<T>(sqlQuery, parameters);
        }
    }
}
