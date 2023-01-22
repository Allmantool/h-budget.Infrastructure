﻿using System.Collections.Generic;

using MediatR;

using HomeBudget.Components.CurrencyRates.Models;
using HomeBudget.Core.Models;

namespace HomeBudget.Components.CurrencyRates.CQRS.Queries.Models
{
    public class GetAllRatesQuery : IRequest<Result<IReadOnlyCollection<CurrencyRateGrouped>>>
    {
    }
}
