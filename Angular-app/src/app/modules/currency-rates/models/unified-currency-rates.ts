import * as _ from 'lodash';
import { CurrencyTrend } from '../../shared/store/models/currency-trend';

import { NationalBankCurrencyRate } from './national-bank-currency-rate';

export class UnifiedCurrencyRates {
	constructor(private rate: Partial<NationalBankCurrencyRate>) {
		this.currencyId = rate.currencyId;
		this.abbreviation = rate.abbreviation;
		this.scale = rate.scale;
		this.name = rate.name;
		this.officialRate = rate.officialRate;
		this.updateDate = rate.updateDate;
		this.ratePerUnit = rate.officialRate && rate.scale
				? _.round(rate.officialRate / rate.scale, 4)
				: undefined;
		this.currencyTrend = CurrencyTrend.notChanged;
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
