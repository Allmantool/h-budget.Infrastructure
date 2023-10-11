﻿using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace HomeBudget.Rates.Api.Middlewares
{
    public class CustomLogicHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = new())
        {
            try
            {
                return Task.FromResult(HealthCheckResult.Healthy("The service is fine"));
            }
            catch (Exception)
            {
                return Task.FromResult(new HealthCheckResult(context.Registration.FailureStatus, "The service in unhealth state"));
            }
        }
    }
}
