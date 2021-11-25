using System.Reflection;

namespace HomeBudget_Web_API.MapperProfileConfigurations
{
    internal static class ApiCallMappingProfiles
    {
        public static Assembly GetExecutingAssembly() => typeof(ApiCallMappingProfiles).Assembly;
    }
}
