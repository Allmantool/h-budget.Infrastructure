using System.Runtime.CompilerServices;
using Serilog;

namespace HomeBudget_Web_API.Extensions
{
    internal static class LoggerExtensions
    {
        public static ILogger Enrich(
            this ILogger logger,
            [CallerMemberName] string memberName = "",
            [CallerLineNumber] int sourceLineNumber = 0)
        {
            return logger
                .ForContext("MemberName", memberName)
                .ForContext("LineNumber", sourceLineNumber);
        }
    }
}
