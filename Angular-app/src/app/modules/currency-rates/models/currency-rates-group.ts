import { CurrencyRate } from 'app/modules/shared/store/models/currency-rates/currency-rate';

export class NationalBankCurrencyRateGroup {
	constructor(currencyRates: Partial<NationalBankCurrencyRateGroup>) {
		this.abbreviation = currencyRates.abbreviation;
		this.scale = currencyRates.scale;
		this.name = currencyRates.name;
		this.rateValues = currencyRates.rateValues;
	}
	currencyId?: number;
	name?: string;
	abbreviation?: string;
	scale?: number;
	rateValues?: CurrencyRate[];
}
