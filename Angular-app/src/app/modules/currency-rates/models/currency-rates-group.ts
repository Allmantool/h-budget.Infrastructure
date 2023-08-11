import { CurrencyRate } from './../../shared/store/models/currency-rates/currency-rate';

export class NationalBankCurrencyRateGroup {
	constructor(currencyRates: Partial<NationalBankCurrencyRateGroup>) {
		this.currencyId = currencyRates.currencyId;
		this.abbreviation = currencyRates.abbreviation;
		this.scale = currencyRates.scale;
		this.name = currencyRates.name;
		
		this.rateValues = currencyRates.rateValues?.map(rv => {
			return <CurrencyRate>{
				updateDate: new Date(rv.updateDate),
				ratePerUnit: rv.ratePerUnit,
				currencyTrend: rv.currencyTrend,
				rateDiff: rv.rateDiff
			}
		});
	}
	currencyId?: number;
	name?: string;
	abbreviation?: string;
	scale?: number;
	rateValues?: CurrencyRate[];
}
