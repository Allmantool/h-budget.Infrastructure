﻿using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace HomeBudget_Web_API.Extensions
{
    internal static class SwaggerExtensions
    {
        public static IServiceCollection SetupSwaggerGen(this IServiceCollection services)
        {
            return services.AddSwaggerGen(options =>
             {
                 options.SwaggerDoc(
                     "v1",
                     new OpenApiInfo
                     {
                         Title = "HomeBudget_Web_API",
                         Version = "v1"
                     });

                 options.CustomSchemaIds(type => type.ToString());
             });
        }

        public static IApplicationBuilder SetUpSwaggerUi(this IApplicationBuilder app)
        {
            return app
                .UseSwagger()
                .UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "HomeBudget_Web_API v1"));
        }
    }
}
