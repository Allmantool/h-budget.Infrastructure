import { CurrencyRate } from './currency-rate';

export interface CurrencyRateGroup {
	currencyId: number;
	currencyRates: CurrencyRate[];
}
