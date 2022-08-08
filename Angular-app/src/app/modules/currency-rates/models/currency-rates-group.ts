import { CurrencyRate } from "app/modules/shared/store/models/currency-rates/currency-rate";
import { CurrencyRateGroup } from "app/modules/shared/store/models/currency-rates/currency-rates-group";
export class NationalBankCurrencyRateGroup {
	constructor(currencyRates: Partial<NationalBankCurrencyRateGroup>) {
		this.abbreviation = currencyRates.abbreviation;
		this.scale = currencyRates.scale;
		this.name = currencyRates.name;
		this.currencyRates = currencyRates.currencyRates;
	}
	currencyId?: number;
	name?: string;
	abbreviation?: string;
	scale?: number;
	currencyRates?: CurrencyRate[];
}
