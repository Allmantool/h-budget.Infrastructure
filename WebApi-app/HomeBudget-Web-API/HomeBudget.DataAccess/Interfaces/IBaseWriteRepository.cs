using System.Threading.Tasks;

namespace HomeBudget.DataAccess.Interfaces
{
    public interface IBaseWriteRepository
    {
        Task<int> SaveAsync(string sqlQuery, object parameters);
    }
}
