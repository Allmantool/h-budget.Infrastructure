using FluentValidation;
using HomeBudget_Web_API.Models;

namespace HomeBudget_Web_API.Validators
{
    public class CurrencyRateValidator : AbstractValidator<CurrencyRate>
    {
        public CurrencyRateValidator()
        {
            RuleFor(x => x.RatePerUnit)
                .GreaterThanOrEqualTo(default(decimal));

            RuleFor(x => x.Abbreviation)
                .NotNull()
                .NotEmpty();

            RuleFor(x => x.Name)
                .NotNull()
                .NotEmpty();

            RuleFor(x => x.OfficialRate)
                .GreaterThanOrEqualTo(default(decimal));

            RuleFor(x => x.Scale)
                .GreaterThanOrEqualTo(default(int));
        }
    }
}
