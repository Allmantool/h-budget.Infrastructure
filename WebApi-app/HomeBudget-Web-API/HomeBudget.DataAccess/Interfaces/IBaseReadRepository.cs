using System.Collections.Generic;
using System.Threading.Tasks;

namespace HomeBudget.DataAccess.Interfaces
{
    public interface IBaseReadRepository
    {
        Task<IReadOnlyCollection<T>> GetAsync<T>(string sqlQuery, object parameters);

        Task<T> SingleAsync<T>(string sqlQuery, object parameters);
    }
}
