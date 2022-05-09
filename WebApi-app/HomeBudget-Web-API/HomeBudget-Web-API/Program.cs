using System.Collections.Generic;
using System.Reflection;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using HomeBudget.Components.CurrencyRates.MapperProfileConfigurations;
using HomeBudget_Web_API.Extensions;
using HomeBudget_Web_API.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var services = builder.Services;
var configuration = builder.Configuration;
var environment = builder.Environment;
_ = builder.Host;

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

services.AddMvc()
    .AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<Program>());

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
    .UseRouting();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

app.UseNationalBankClientWarmUpMiddleware(services);

app.Run();