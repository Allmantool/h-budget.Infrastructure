using HomeBudget.DataAccess.Dapper.SqlClients.MsSql;
using HomeBudget.DataAccess.Interfaces;
using Microsoft.Extensions.DependencyInjection;

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
