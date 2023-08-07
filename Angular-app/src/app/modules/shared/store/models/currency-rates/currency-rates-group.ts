import { CurrencyRate } from './currency-rate';

export interface CurrencyRateGroup {
	currencyId: number;
    name: string;
    abbreviation: string;
    scale: number;
	currencyRates: CurrencyRate[];
}
