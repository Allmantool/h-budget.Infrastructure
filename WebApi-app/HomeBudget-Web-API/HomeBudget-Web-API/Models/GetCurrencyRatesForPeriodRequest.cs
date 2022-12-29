using System;

namespace HomeBudget_Web_API.Models
{
    public class GetCurrencyRatesForPeriodRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
