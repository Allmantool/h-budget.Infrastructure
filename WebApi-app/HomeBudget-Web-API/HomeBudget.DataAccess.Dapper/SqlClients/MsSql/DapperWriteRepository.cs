using System.Data;
using System.Threading.Tasks;
using Dapper;
using HomeBudget.Core.Models;
using HomeBudget.DataAccess.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace HomeBudget.DataAccess.Dapper.SqlClients.MsSql
{
    public class DapperWriteRepository : IBaseWriteRepository
    {
        private readonly DatabaseOptions _databaseOptions;

        public DapperWriteRepository(IOptions<DatabaseOptions> options) => _databaseOptions = options.Value;

        public async Task<int> SaveAsync(string sqlQuery, object parameters)
        {
            using IDbConnection db = new SqlConnection(_databaseOptions.ConnectionString);

            return await db.ExecuteAsync(sqlQuery, parameters);
        }
    }
}
