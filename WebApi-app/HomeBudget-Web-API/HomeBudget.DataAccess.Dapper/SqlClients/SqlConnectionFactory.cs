using System;
using System.Data;
using HomeBudget.Core.Extensions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using HomeBudget.Core.Models;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.DataAccess.Dapper.SqlClients
{
    internal class SqlConnectionFactory : ISqlConnectionFactory
    {
        private readonly ILogger<SqlConnectionFactory> _logger;
        private readonly DatabaseOptions _databaseOptions;

        public SqlConnectionFactory(
            ILogger<SqlConnectionFactory> logger,
            IOptions<DatabaseOptions> options)
        {
            _logger = logger;
            _databaseOptions = options.Value;
        }

        public IDbConnection Create()
        {
            try
            {
                return new SqlConnection(_databaseOptions.ConnectionString);
            }
            catch (Exception ex)
            {
                _logger.LogWithExecutionMemberName(
                    $"Failed connect to database with connection string: '{_databaseOptions.ConnectionString}'. " +
                    $"Error message: '{ex.Message}'",
                    LogLevel.Critical);

                throw;
            }
        }
    }
}
