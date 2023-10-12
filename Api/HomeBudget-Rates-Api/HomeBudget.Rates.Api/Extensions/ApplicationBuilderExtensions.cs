﻿using System;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;

using HomeBudget.Rates.Api.Configuration;
using HomeBudget.Rates.Api.Constants;
using HomeBudget.Rates.Api.Middlewares;

namespace HomeBudget.Rates.Api.Extensions
{
    internal static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder SetUpBaseApplication(
            this IApplicationBuilder app,
            IServiceCollection services,
            IWebHostEnvironment env,
            IConfiguration configuration)
        {
            app.SetUpSwaggerUi();

            Log.Information("Current env is '{0}'.", env.EnvironmentName);

            if (env.IsDevelopment() || env.IsEnvironment(HostEnvironments.Docker))
            {
                app.UseDeveloperExceptionPage();

                app.UseCors(corsPolicyBuilder =>
                {
                    var uiOrigin = configuration["UiOriginsUrl"];

                    Log.Information("UI origin is '{0}'", uiOrigin);

                    corsPolicyBuilder
                        .WithOrigins(uiOrigin ?? throw new InvalidOperationException())
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            }

            return app
                .UseHsts()
                .UseHttpsRedirection()
                .UseResponseCaching()
                .UseAuthorization()
                .UseRouting()
                .UseSerilogRequestLogging(options =>
                {
                    // Customize the message template
                    options.MessageTemplate = "Handled {RequestPath}";

                    // Emit debug-level events instead of the defaults
                    options.GetLevel = (_, _, _) => LogEventLevel.Debug;

                    // Attach additional properties to the request completion event
                    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
                    {
                        diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
                        diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
                    };
                })
                .SetUpHealthCheckEndpoints()
                .UseEndpoints(endpoints =>
                {
                    endpoints.MapControllers();
                })
                .UseNationalBankClientWarmUpMiddleware(services);
        }
    }
}