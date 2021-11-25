using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using HomeBudget.Core.Models;
using HomeBudget.DataAccess.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace HomeBudget.DataAccess.Dapper.SqlClients.MsSql
{
    public class DapperReadRepository : IBaseReadRepository
    {
        private readonly DatabaseOptions _databaseOptions;

        public DapperReadRepository(IOptions<DatabaseOptions> options) => _databaseOptions = options.Value;

        public async Task<IEnumerable<T>> GetAsync<T>(string sqlQuery, object parameters)
        {
            using IDbConnection db = new SqlConnection(_databaseOptions.ConnectionString);

            return await db.QueryAsync<T>(sqlQuery, parameters).ConfigureAwait(false);
        }
    }
}
