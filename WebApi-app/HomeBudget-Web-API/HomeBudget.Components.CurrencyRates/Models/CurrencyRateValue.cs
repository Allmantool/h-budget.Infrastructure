using System;

namespace HomeBudget.Components.CurrencyRates.Models
{
    public class CurrencyRateValue
    {
        public decimal OfficialRate { get; set; }

        public decimal RatePerUnit { get; set; }

        public DateTime UpdateDate { get; set; }
    }
}
