using System;

namespace HomeBudget_Web_API.Models
{
    public class GetCurrencyRatesForPeriodRequest
    {
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
    }
}
