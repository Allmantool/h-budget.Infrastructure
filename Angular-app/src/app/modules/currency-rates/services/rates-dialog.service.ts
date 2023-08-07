import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

import * as _ from 'lodash';
import { take, Subject } from 'rxjs';
import { Store } from '@ngxs/store';

import { NationalBankCurrencyRateGroup } from '../models/currency-rates-group';
import { NationalBankCurrencyProvider } from '../providers/national-bank-currency.provider';
import { DialogContainer } from '../../shared/models/dialog-container';
import { DialogDaysRangePayload } from './../../shared/models/dialog-dates-range-payload';
import { AddCurrencyGroups } from './../../shared/store/actions/currency-rates.actions';
import { DateRangeDialogComponent } from './../../shared/components/dialog/dates-rage/dates-range-dialog.component';
import { DialogProvider } from './../../shared/providers/dialog-provider';
import { CurrencyRateGroup } from './../../shared/store/models/currency-rates/currency-rates-group';

@Injectable({
	providedIn: 'root',
})
export class RatesDialogService {
	constructor(
		private dialogProvider: DialogProvider,
		private currencyRateProvider: NationalBankCurrencyProvider,
		private store: Store
	) {}

	public openLoadRatesForPeriod(): void {
		const config = new MatDialogConfig<DialogContainer>();

		const onGetRatesForPeriod = (payload: DialogDaysRangePayload) => {
			if (_.isNil(payload)) {
				return;
			}

            const ratesAmountForPeriodSubject = new Subject<number>();

			this.currencyRateProvider
				.getCurrenciesForSpecifiedPeriod(payload)
				.pipe(take(1))
				.subscribe((unifiedRates) => {
					this.store.dispatch(
						new AddCurrencyGroups(
							this.mapToCurrencyRateGroups(unifiedRates)
						)
					);

                    ratesAmountForPeriodSubject.next(unifiedRates?.length);
				});

                return ratesAmountForPeriodSubject;
		};

		config.data = {
			title: 'Update rates for specify period:',
			onSubmit: onGetRatesForPeriod,
		} as DialogContainer;

		this.dialogProvider.openDialog(DateRangeDialogComponent, config);
	}

	private mapToCurrencyRateGroups(
		todayRatesGroups: NationalBankCurrencyRateGroup[]
	): CurrencyRateGroup[] {
		return _.map(
			todayRatesGroups,
			(rg) =>
				({
					currencyId: rg.currencyId,
					currencyRates: rg.rateValues,
				}) as CurrencyRateGroup
		);
	}
}
