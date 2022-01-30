import * as _ from 'lodash';
import { CurrencyTrend } from '../../shared/Store/models/currency-trend';

import { NationalBankCurrencyRate } from './national-bank-currency-rate';

export class UnifiedCurrencyRates {
	constructor(private rate: Partial<NationalBankCurrencyRate>) {
		this.currencyId = rate.Cur_ID;
		this.abbreviation = rate.Cur_Abbreviation;
		this.scale = rate.Cur_Scale;
		this.name = rate.Cur_Name;
		this.officialRate = rate.Cur_OfficialRate;
		this.updateDate = rate.Date;
		this.ratePerUnit =
			rate.Cur_OfficialRate && rate.Cur_Scale
				? _.round(rate.Cur_OfficialRate / rate.Cur_Scale, 4)
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
}
