using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Serilog.Events;

using HomeBudget_Web_API.Middlewares;

namespace HomeBudget_Web_API.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder SetUpBaseApplication(
            this IApplicationBuilder app,
            IServiceCollection services,
            bool isDevelopment = false)
        {
            if (isDevelopment)
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "HomeBudget_Web_API v1"));
                app.UseCors(corsPolicyBuilder =>
                {
                    corsPolicyBuilder
                        .AllowAnyOrigin()
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
        }
    }
}
