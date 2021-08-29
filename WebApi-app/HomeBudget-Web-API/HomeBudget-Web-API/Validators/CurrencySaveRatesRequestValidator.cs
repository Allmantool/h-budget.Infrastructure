using FluentValidation;
using HomeBudget_Web_API.Models;

namespace HomeBudget_Web_API.Validators
{
    public class CurrencySaveRatesRequestValidator : AbstractValidator<CurrencySaveRatesRequest>
    {
        public CurrencySaveRatesRequestValidator() => RuleForEach(x => x.CurrencyRates)
            .SetValidator(new CurrencyRateValidator());

    }
}
