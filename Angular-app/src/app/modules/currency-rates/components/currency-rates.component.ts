import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import * as _ from 'lodash';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { NationalBankCurrencyProvider } from '../providers/national-bank-currency.provider';
import { CurrencyRate } from '../../shared/Store/models/currency-rate';
import { AddRange } from '../../shared/store/actions/currency-rates.actions';

@Component({
	selector: 'app-currency-rates',
	templateUrl: './currency-rates.component.html',
	styleUrls: ['./currency-rates.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatesComponent implements OnInit, OnDestroy {
	public displayedColumns: string[] = [
		'id',
		'abbreviation',
		'scale',
		'name',
		'officialRate',
		'ratePerUnit',
		'updateDate',
	];

	private subs: Subscription[] = [];
	public todayCurrencyRates$: Subject<UnifiedCurrencyRates[]> = new Subject<
		UnifiedCurrencyRates[]
	>();

	constructor(
		private currencyRateProvider: NationalBankCurrencyProvider,
		private store: Store
	) {}
	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}
	ngOnInit(): void {
		const getRatesSub$ = this.todayCurrencyRates$
			.pipe(
				switchMap((rates) => {
					const currencyRates: CurrencyRate[] = _.map(
						rates,
						(r) =>
							({
								currencyId: r.currencyId,
								updateDate: r.updateDate,
								ratePerUnit: r.ratePerUnit,
							} as CurrencyRate)
					);

					this.store.dispatch(new AddRange(currencyRates));

					return this.currencyRateProvider.saveCurrencies(rates);
				})
			)
			.subscribe((affectedRowCount) => console.log(affectedRowCount));

		if (getRatesSub$) {
			this.subs.push(getRatesSub$);
		}
	}

	public showUpTodayCurrencyRates(): void {
		this.currencyRateProvider
			.getTodayCurrencies()
			.subscribe((r) => this.todayCurrencyRates$.next(r));

		return;
	}
}
