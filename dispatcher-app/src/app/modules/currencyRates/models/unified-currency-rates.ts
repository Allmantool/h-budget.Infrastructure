import * as _ from 'lodash';

import { NationalBankCurrencyRate } from './national-bank-currency-rate';

export class UnifiedCurrencyRates {
    constructor(private rate: Partial<NationalBankCurrencyRate>) {
        this.id = rate.Cur_ID;
        this.abbreviation = rate.Cur_Abbreviation;
        this.scale = rate.Cur_Scale;
        this.name = rate.Cur_Name;
        this.officialRate = rate.Cur_OfficialRate;
        this.ratePerUnit = rate.Cur_OfficialRate && rate.Cur_Scale
          ? _.round(rate.Cur_OfficialRate / rate.Cur_Scale, 4)
          : undefined
    }

    id?: number;
    abbreviation?: string;
    scale?: number;
    name?: string;
    officialRate?: number;
    ratePerUnit?: number;
}
