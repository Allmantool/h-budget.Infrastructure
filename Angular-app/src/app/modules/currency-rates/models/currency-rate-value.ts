export class CurrencyRateValue {
	constructor(currencyRates: Partial<CurrencyRateValue>) {
		this.updateDate = currencyRates.updateDate;
		this.officialRate = currencyRates.officialRate;
		this.ratePerUnit = currencyRates.ratePerUnit;
	}

	ratePerUnit?: number;
	updateDate?: Date;
	officialRate?: number;
}
