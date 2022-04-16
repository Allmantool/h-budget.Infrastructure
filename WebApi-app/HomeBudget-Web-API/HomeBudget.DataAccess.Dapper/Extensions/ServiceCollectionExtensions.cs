using Microsoft.Extensions.DependencyInjection;
using HomeBudget.DataAccess.Dapper.SqlClients.MsSql;
using HomeBudget.DataAccess.Interfaces;

namespace HomeBudget.DataAccess.Dapper.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection RegistryDapperIoCDependencies(this IServiceCollection services)
            => services
                .AddScoped<IBaseWriteRepository, DapperWriteRepository>()
                .AddScoped<IBaseReadRepository, DapperReadRepository>();
    }
}
