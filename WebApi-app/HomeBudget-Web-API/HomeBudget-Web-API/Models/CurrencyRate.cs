using System;

namespace HomeBudget_Web_API.Models
{
    public class CurrencyRate
    {
        public int CurrencyId { get; set; }

        public string Name { get; set; }

        public string Abbreviation { get; set; }

        public int Scale { get; set; }

        public decimal OfficialRate { get; set; }

        public decimal RatePerUnit { get; set; }

        public DateTime UpdateDate { get; set; }
    }
}
