using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

using HomeBudget.Core.Models;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.DataAccess.Dapper.SqlClients.MsSql
{
    public class DapperReadRepository : IBaseReadRepository
    {
        private readonly DatabaseOptions _databaseOptions;

        public DapperReadRepository(IOptions<DatabaseOptions> options) => _databaseOptions = options.Value;

        public async Task<IReadOnlyCollection<T>> GetAsync<T>(string sqlQuery, object parameters)
        {
            using IDbConnection db = new SqlConnection(_databaseOptions.ConnectionString);
            var result = await db.QueryAsync<T>(sqlQuery, parameters);

            return result.ToList();
        }

        public async Task<T> SingleAsync<T>(string sqlQuery, object parameters)
        {
            using IDbConnection db = new SqlConnection(_databaseOptions.ConnectionString);

            return await db.QuerySingleAsync<T>(sqlQuery, parameters);
        }
    }
}
