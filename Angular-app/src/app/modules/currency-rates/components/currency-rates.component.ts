import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
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
	@Select(CurrencyRatesState.getCurrencyRatesFromPreviousDay) previousDayRates$!: Observable<CurrencyRate[]>;

	public trendRateLookup: { [trendDirection: string]: string } = {
		[CurrencyTrend.up]: 'chartreuse',
		[CurrencyTrend.down]: 'crimson',
	};

	public todayCurrencyRates$: Subject<UnifiedCurrencyRates[]> = new Subject<
		UnifiedCurrencyRates[]
	>();

	public todayRatesTableDataSource = new MatTableDataSource<UnifiedCurrencyRates>([]);
	public todayRatesTableSelection = new SelectionModel<UnifiedCurrencyRates>(
		false,
		[]
	);

	public displayedColumns: string[] = [
		'select',
		'id',
		'abbreviation',
		'name',
		'ratePerUnit',
		'percentageDiff',
		'updateDate',
	];

	private subs: Subscription[] = [];

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
					this.todayRatesTableDataSource =
						new MatTableDataSource<UnifiedCurrencyRates>(rates);
					this.todayRatesTableSelection =
						new SelectionModel<UnifiedCurrencyRates>(
							false,
							rates.filter((i) => i.currencyId == 431)
						);

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

	public isAllSelected() {
		const numSelected = this.todayRatesTableSelection.selected.length;
		const numRows = this.todayRatesTableDataSource.data.length;

		return numSelected === numRows;
	}

	public masterToggle() {
		const isAllSelected: boolean = this.isAllSelected();

		if (isAllSelected && this.todayRatesTableSelection.selected.length === 1) {
			return;
		}

		const currencyRatesForselectByDefault: UnifiedCurrencyRates = this.todayRatesTableDataSource.data[0];

		if (isAllSelected) {
			this.todayRatesTableSelection.clear();
			this.todayRatesTableSelection.select(currencyRatesForselectByDefault)
		} 
		else {
			this.todayRatesTableSelection.select(...this.todayRatesTableDataSource.data);
		}
	}

	public showUpTodayCurrencyRates(): void {
		combineLatest([
			this.previousDayRates$,
			this.currencyRateProvider.getTodayCurrencies(),
		])
			.pipe(take(1))
			.subscribe(([previousDayrates, todayRates]) => {
				todayRates.forEach((tr) => {
					const previousDateRate = previousDayrates.find(
						(i) => i.currencyId == tr.currencyId
					);

					if (_.isNil(previousDateRate) || _.isNil(tr.ratePerUnit)){
						return;
					}

					tr.currencyTrend = this.getTrend(
						tr.ratePerUnit,
						previousDateRate.ratePerUnit
					);

					tr.rateDiff = _.round(((tr.ratePerUnit - previousDateRate.ratePerUnit) / previousDateRate.ratePerUnit * 100), 2).toFixed(2);
				});
				this.todayCurrencyRates$.next(todayRates);

				this.upddateCurrencyStateStore(todayRates);
			});
	}

	private upddateCurrencyStateStore(
		todayRates: UnifiedCurrencyRates[]
	): void {
		const currencyRates: CurrencyRate[] = _.map(
			todayRates,
			(r) =>
				({
					currencyId: r.currencyId,
					updateDate: r.updateDate,
					ratePerUnit: r.ratePerUnit,
				} as CurrencyRate)
		);

		this.store.dispatch(new AddRange(currencyRates));
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
