using System;

using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Events;

using HomeBudget_Web_API.Middlewares;
using HomeBudget_Web_API.Constants;

namespace HomeBudget_Web_API.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder SetUpBaseApplication(
            this IApplicationBuilder app,
            IServiceCollection services,
            IWebHostEnvironment env,
            IConfiguration configuration)
        {
            if (env.IsDevelopment() || env.IsEnvironment("Docker"))
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "HomeBudget_Web_API v1"));
                app.UseCors(corsPolicyBuilder =>
                {
                    corsPolicyBuilder
                        .WithOrigins(configuration["UiOriginsUrl"] ?? throw new InvalidOperationException())
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            }

            return app.UseHsts()
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
                .UseEndpoints(config =>
                {
                    config.MapHealthChecks(Endpoints.HealthCheckSource, new HealthCheckOptions
                    {
                        Predicate = _ => true,
                        ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
                    });

                    config.MapHealthChecksUI(options =>
                    {
                        options.UIPath = "/show-health-ui";
                        options.ApiPath = "/health-ui-api";
                    });
                })
                .UseEndpoints(endpoints =>
                {
                    endpoints.MapControllers();
                })
                .UseNationalBankClientWarmUpMiddleware(services);
        }
    }
}
