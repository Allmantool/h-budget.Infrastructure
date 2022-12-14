using System;
using System.Collections.Generic;
using System.Reflection;

using FluentValidation;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Sinks.Elasticsearch;

using HomeBudget.Components.CurrencyRates.MapperProfileConfigurations;
using HomeBudget_Web_API.Extensions;
using HomeBudget_Web_API.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var services = builder.Services;
var environment = builder.Environment;
var configuration = builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{environment.EnvironmentName}.json", optional: true)
    .Build();

var host = builder.Host;

host.UseSerilog();

// This method gets called by the runtime. Use this method to add services to the container.
services.AddControllers();
services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "HomeBudget_Web_API", Version = "v1" });
    options.CustomSchemaIds(type => type.ToString());
});

await services.SetUpDiAsync(configuration);
services.AddAutoMapper(new List<Assembly>
{
    typeof(Program).Assembly,
    CurrencyRatesComponentMappingProfiles.GetExecutingAssembly(),
});

services.AddHealthChecks()
    .AddCheck("heartbeat", () => HealthCheckResult.Healthy())
    .AddCheck<CustomLogicHealthCheck>(nameof(CustomLogicHealthCheck), tags: new[] { "custom" })
    .AddSqlServer(builder.Configuration.GetRequiredSection("DatabaseOptions:ConnectionString").Value, tags: new[] { "sqlServer" })
    .AddRedis(builder.Configuration.GetRequiredSection("DatabaseOptions:RedisConnectionString").Value, tags: new[] { "redis" });

services.AddHealthChecksUI(setupSettings: setup =>
{
    setup.AddHealthCheckEndpoint("currency rates service", "/health");
}).AddInMemoryStorage();

services.AddValidatorsFromAssemblyContaining<Program>();

services.AddResponseCaching();

// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
var app = builder.Build();

if (environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "HomeBudget_Web_API v1"));
    app.UseCors(corsPolicyBuilder =>
    {
        corsPolicyBuilder.AllowAnyOrigin();
        corsPolicyBuilder.AllowAnyHeader();
        corsPolicyBuilder.AllowAnyMethod();
    });
}

app.UseHsts()
    .UseHttpsRedirection()
    .UseResponseCaching()
    .UseAuthorization()
    .UseRouting()
    .UseEndpoints(config =>
    {
        config.MapHealthChecks("/health", new HealthCheckOptions
        {
            Predicate = _ => true,
            ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
        });

        config.MapHealthChecksUI();
    })
    .UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    })
    .UseNationalBankClientWarmUpMiddleware(services);

Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Debug()
    .WriteTo.Console()
    .WriteTo.Elasticsearch(ConfigureElasticSink(configuration, environment.EnvironmentName))
    .Enrich.WithProperty("Environment", environment)
    .ReadFrom.Configuration(configuration)
    .CreateLogger();

try
{
    app.Run();
    Log.Information("The app has been started.");
}
catch (Exception ex)
{
    Log.Fatal($"Failed to start {typeof(Program).Assembly.GetName().Name}", ex);
    throw;
}

static ElasticsearchSinkOptions ConfigureElasticSink(IConfigurationRoot configuration, string environment)
{
    var formattedExecuteAssemblyName = typeof(Program).Assembly.GetName().Name?.ToLower().Replace(".", "-");
    var formattedEnvironmentName = environment?.ToLower().Replace(".", "-");

    return new ElasticsearchSinkOptions(new Uri(configuration["ElasticConfiguration:Uri"]))
    {
        AutoRegisterTemplate = true,
        IndexFormat = $"{formattedExecuteAssemblyName}-{formattedEnvironmentName}-{DateTime.UtcNow.Ticks.ToString("x")}"
    };
}