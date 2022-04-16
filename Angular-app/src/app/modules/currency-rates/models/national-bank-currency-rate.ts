export class NationalBankCurrencyRate {
	constructor(private currencyRates: Partial<NationalBankCurrencyRate>) {
		this.updateDate = currencyRates.updateDate;
		this.abbreviation = currencyRates.abbreviation;
		this.scale = currencyRates.scale;
		this.name = currencyRates.name;
		this.officialRate = currencyRates.officialRate;
	}

	currencyId?: number;
	updateDate?: Date;
	abbreviation?: string;
	scale?: number;
	name?: string;
	officialRate?: number;
}
