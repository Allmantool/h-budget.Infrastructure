import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import * as _ from 'lodash';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { NationalBankCurrencyRateGroup } from '../models/currency-rates-group';

@Injectable({
	providedIn: 'root',
})
export class CurrencyRatesGridService {
	public GetDataSource(
		rateGroups: NationalBankCurrencyRateGroup[]
	): MatTableDataSource<UnifiedCurrencyRates> {
		const rates: UnifiedCurrencyRates[] = _.map(rateGroups, (rg) => this.mapFromCurrencyRateGroupToCurrencyRate(rg));

		return new MatTableDataSource<UnifiedCurrencyRates>(rates);
	}

	public GetTableSelection(rateGroups: NationalBankCurrencyRateGroup[], currencyId: number): SelectionModel<UnifiedCurrencyRates> {

        const selectedGroups =  _.filter(rateGroups, (rg : NationalBankCurrencyRateGroup) => rg.currencyId === currencyId);

        return new SelectionModel<UnifiedCurrencyRates>(
            false,
            _.map(selectedGroups, gr => this.mapFromCurrencyRateGroupToCurrencyRate(gr))
        );
    }

    private mapFromCurrencyRateGroupToCurrencyRate(rg : NationalBankCurrencyRateGroup) : UnifiedCurrencyRates {
        const todayRate = _.first(rg.rateValues);

        return new UnifiedCurrencyRates({
            currencyId: rg.currencyId,
            abbreviation: rg.abbreviation,
            scale: rg.scale,
            name: rg.name,
            officialRate: todayRate?.ratePerUnit,
            updateDate: todayRate?.updateDate,
        });
    }
}
