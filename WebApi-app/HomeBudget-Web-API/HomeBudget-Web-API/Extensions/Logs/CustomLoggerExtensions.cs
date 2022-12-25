using System;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Exceptions;
using Serilog.Sinks.Elasticsearch;

using ILogger = Serilog.ILogger;

namespace HomeBudget_Web_API.Extensions.Logs
{
    internal static class CustomLoggerExtensions
    {
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
