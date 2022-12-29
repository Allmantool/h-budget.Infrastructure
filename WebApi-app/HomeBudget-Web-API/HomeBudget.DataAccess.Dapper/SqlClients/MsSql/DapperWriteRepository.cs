using System.Threading.Tasks;

using Dapper;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.DataAccess.Dapper.SqlClients.MsSql
{
    public class DapperWriteRepository : IBaseWriteRepository
    {
        private readonly ISqlConnectionFactory _sqlConnectionFactory;

        public DapperWriteRepository(ISqlConnectionFactory sqlConnectionFactory)
        {
            _sqlConnectionFactory = sqlConnectionFactory;
        }

        public async Task<int> SaveAsync<T>(string sqlQuery, T parameters)
        {
            using var db = _sqlConnectionFactory.Create();

            return await db.ExecuteAsync(sqlQuery, parameters);
        }
    }
}
