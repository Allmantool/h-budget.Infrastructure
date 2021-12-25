import { CurrencyTrend } from "./currency-trend";

export interface CurrencyRate {
	currencyId: number;
	updateDate: Date;
	ratePerUnit: number;
	currencyTrend: CurrencyTrend;
}
