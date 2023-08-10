import * as _ from 'lodash';

import { CurrencyTrend } from './../../shared/store/models/currency-rates/currency-trend';
import { NationalBankCurrencyRate } from './national-bank-currency-rate';

export class UnifiedCurrencyRates {
	constructor(rate: Partial<NationalBankCurrencyRate>) {
		this.currencyId = rate.currencyId;
		this.abbreviation = rate.abbreviation;
		this.scale = rate.scale;
		this.name = rate.name;
		this.officialRate = rate.officialRate;
		this.updateDate = rate.updateDate;

		this.ratePerUnit = rate.ratePerUnit;
		this.currencyTrend = rate.currencyTrend ?? CurrencyTrend.notChanged;
	}

	currencyId?: number;
	abbreviation?: string;
	scale?: number;
	name?: string;
	officialRate?: number;
	updateDate?: Date;
	ratePerUnit?: number;
	currencyTrend?: string;
	rateDiff?: string;
}
