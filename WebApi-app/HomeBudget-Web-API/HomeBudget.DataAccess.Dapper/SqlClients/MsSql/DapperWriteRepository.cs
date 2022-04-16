using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using HomeBudget.Core.Models;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.DataAccess.Dapper.SqlClients.MsSql
{
    public class DapperWriteRepository : IBaseWriteRepository
    {
        private readonly DatabaseOptions _databaseOptions;

        public DapperWriteRepository(IOptions<DatabaseOptions> options) => _databaseOptions = options.Value;

        public async Task<int> SaveAsync<T>(string sqlQuery, T parameters)
        {
            using IDbConnection db = new SqlConnection(_databaseOptions.ConnectionString);

            return await db.ExecuteAsync(sqlQuery, parameters);
        }
    }
}
