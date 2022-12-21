using System;
using System.Runtime.CompilerServices;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Exceptions;
using Serilog.Sinks.Elasticsearch;
using ILogger = Serilog.ILogger;
using IMicrosoftILogger = Microsoft.Extensions.Logging.ILogger;

namespace HomeBudget_Web_API.Extensions
{
    internal static class CustomLoggerExtensions
    {
        public static IMicrosoftILogger EnrichExectionMemberName(
            this IMicrosoftILogger logger,
            [CallerMemberName] string memberName = "",
            [CallerLineNumber] int sourceLineNumber = 0)
        {
            Log.Logger
                .ForContext("MemberName", memberName)
                .ForContext("LineNumber", sourceLineNumber);

            return logger.;
        }

        public static ILogger InitializeLogger(this IConfiguration configuration, IWebHostEnvironment environment, ConfigureHostBuilder host)
        {
            Log.Logger = new LoggerConfiguration()
                 .Enrich.FromLogContext()
                 .Enrich.WithMachineName()
                 .Enrich.WithExceptionDetails()
                 .Enrich.WithProperty("Environment", environment)
                 .WriteTo.Debug()
                 .WriteTo.Console()
                 .WriteTo.Elasticsearch(ConfigureElasticSink(configuration, environment.EnvironmentName))
                 .ReadFrom.Configuration(configuration)
                 .CreateLogger();

            host.UseSerilog(Log.Logger);

            return Log.Logger;
        }

        private static ElasticsearchSinkOptions ConfigureElasticSink(IConfiguration configuration, string environment)
        {
            var formattedExecuteAssemblyName = typeof(Program).Assembly.GetName().Name?.Replace(".", "-");
            var formattedEnvironmentName = environment?.Replace(".", "-");
            var dateIndexPostfix = DateTime.UtcNow.ToString("MM-yyyy");

            return new ElasticsearchSinkOptions(new Uri(configuration["ElasticConfiguration:Uri"]))
            {
                AutoRegisterTemplate = true,
                TypeName = null,
                AutoRegisterTemplateVersion = AutoRegisterTemplateVersion.ESv7,
                BatchAction = ElasticOpType.Create,
                NumberOfReplicas = 1,
                NumberOfShards = 2,
                IndexFormat = $"{formattedExecuteAssemblyName}-{formattedEnvironmentName}-{dateIndexPostfix}".ToLower()
            };
        }
    }
}
