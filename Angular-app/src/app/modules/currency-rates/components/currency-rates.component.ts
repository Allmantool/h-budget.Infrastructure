import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import * as _ from 'lodash';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { NationalBankCurrencyProvider } from '../providers/national-bank-currency.provider';
import { CurrencyRate } from '../../shared/Store/models/currency-rate';
import { AddRange } from '../../shared/store/actions/currency-rates.actions';
import { CurrencyRatesState } from '../../shared/store/states/currency-rates.state';
import { CurrencyTrend } from '../../shared/Store/models/currency-trend';

@Component({
	selector: 'app-currency-rates',
	templateUrl: './currency-rates.component.html',
	styleUrls: ['./currency-rates.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatesComponent implements OnInit, OnDestroy {
	@Select(CurrencyRatesState.getRates) rates$!: Observable<CurrencyRate[]>;
	@Select(CurrencyRatesState.getCurrencyRatesFromPreviousDay) previousDayrates$!: Observable<CurrencyRate[]>;

	public trendRateLookup: { [email: string]: string; } = {
		[CurrencyTrend.up]: 'chartreuse',
		[CurrencyTrend.down]: 'crimson'
	}

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
	) { }
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
		combineLatest([this.previousDayrates$, this.currencyRateProvider.getTodayCurrencies()])
			.pipe(
				take(1)
			)
			.subscribe(([previousDayrates, todayRates]) => {

				todayRates.forEach(tr => {
					tr.currencyTrend = this.getTrend(
						tr.ratePerUnit,
						previousDayrates.find(i => i.currencyId == tr.currencyId)?.ratePerUnit)
				});

				this.todayCurrencyRates$.next(todayRates);

				const currencyRates: CurrencyRate[] = _.map(
					todayRates,
					(r) =>
					({
						currencyId: r.currencyId,
						updateDate: r.updateDate,
						ratePerUnit: r.ratePerUnit,
						currencyTrend: r.currencyTrend
					} as CurrencyRate)
				);

				this.store.dispatch(new AddRange(currencyRates));
			})
	}

	private getTrend(todayDayRate?: number, previousDayRate?: number): string {
		if (_.isNil(todayDayRate) || _.isNil(previousDayRate)) {
			return CurrencyTrend.notChanged;
		}

		if (todayDayRate === previousDayRate) {
			return CurrencyTrend.notChanged;
		}

		if (todayDayRate > previousDayRate) {
			return CurrencyTrend.up;
		}

		return CurrencyTrend.down;
	}
}