using System.Collections.Generic;
using System.Threading.Tasks;

namespace HomeBudget.DataAccess.Interfaces
{
    public interface IBaseReadRepository
    {
        Task<IEnumerable<T>> GetAsync<T>(string sqlQuery, object parameters);
    }
}
