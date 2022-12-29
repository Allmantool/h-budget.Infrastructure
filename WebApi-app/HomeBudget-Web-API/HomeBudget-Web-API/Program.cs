using System;
using System.Collections.Generic;
using System.Reflection;

using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;
using Serilog;

using HomeBudget.Components.CurrencyRates.MapperProfileConfigurations;
using HomeBudget_Web_API.Extensions;
using HomeBudget_Web_API.Middlewares;
using HomeBudget_Web_API.Extensions.Logs;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var services = builder.Services;
var environment = builder.Environment;
var configuration = builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{environment.EnvironmentName}.json", optional: true)
    .Build();

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

services
    .AddHealthChecks()
    .AddCheck("heartbeat", () => HealthCheckResult.Healthy())
    .AddCheck<CustomLogicHealthCheck>(nameof(CustomLogicHealthCheck), tags: new[] { "custom" })
    .AddSqlServer(builder.Configuration.GetRequiredSection("DatabaseOptions:ConnectionString").Value, tags: new[] { "sqlServer" })
    .AddRedis(builder.Configuration.GetRequiredSection("DatabaseOptions:RedisConnectionString").Value, tags: new[] { "redis" });

services
    .AddHealthChecksUI(setupSettings: setup =>
    {
        setup.AddHealthCheckEndpoint("currency rates service", "/health");
    })
    .AddInMemoryStorage();

services
    .AddValidatorsFromAssemblyContaining<Program>()
    .AddResponseCaching();

configuration.InitializeLogger(environment, builder.Host);

// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
var app = builder.Build();

app.SetUpBaseApplication(services, environment);

var executionAppName = typeof(Program).Assembly.GetName().Name;

try
{
    Log.Information("The app '{0}' is about to start.", executionAppName);

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, $"Application terminated unexpectedly, failed to start {executionAppName}");
    Log.CloseAndFlush();
}