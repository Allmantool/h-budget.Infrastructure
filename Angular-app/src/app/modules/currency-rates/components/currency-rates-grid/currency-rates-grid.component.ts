import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogConfig } from '@angular/material/dialog';

import { Select, Store } from '@ngxs/store';
import { switchMap, take } from 'rxjs/operators';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import * as _ from 'lodash';

import { UnifiedCurrencyRates } from '../../models/unified-currency-rates';
import { NationalBankCurrencyProvider } from '../../providers/national-bank-currency.provider';
import { CurrencyRate } from '../../../shared/store/models/currency-rates/currency-rate';
import { AddRange, SetActive } from '../../../shared/store/actions/currency-rates.actions';
import { CurrencyRatesState } from '../../../shared/store/states/currency-rates.state';
import { CurrencyTrend } from './../../../shared/store/models/currency-rates/currency-trend';
import { CurrencyTableOptions } from './../../../shared/store/models/currency-rates/currency-table-options';
import { DialogProvider } from './../../../shared/providers/dialog-provider';
import { DateRangeDialogComponent } from './../../../shared/components/dialog/dates-rage/dates-range-dialog.component';

@Component({
	selector: 'app-currency-rates-grid',
	templateUrl: './currency-rates-grid.component.html',
	styleUrls: ['./currency-rates-grid.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatesGridComponent implements OnInit, OnDestroy {
	@Select(CurrencyRatesState.getRates) rates$!: Observable<CurrencyRate[]>;
	@Select(CurrencyRatesState.getCurrencyTableOptions) currencyTableOptions$!: Observable<CurrencyTableOptions>;
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
		private dialogProvider: DialogProvider,
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
					this.todayRatesTableDataSource = new MatTableDataSource<UnifiedCurrencyRates>(rates);

					return this.currencyRateProvider.saveCurrencies(rates);
				})
			)
			.subscribe((affectedRowCount) => console.log(affectedRowCount));

		const getTableOptions$ = combineLatest([
			this.currencyTableOptions$,
			this.todayCurrencyRates$
		])
			.pipe()
			.subscribe(([tableOptions, todayRates]) => {
				this.todayRatesTableSelection = new SelectionModel<UnifiedCurrencyRates>(
					false,
					todayRates.filter((i) => i.currencyId == tableOptions.selectedItem.currencyId)
				)
			});

		if (getRatesSub$) {
			this.subs.push(getRatesSub$);
			this.subs.push(getTableOptions$);
		}

		this.getTodayCurrencyRates();
	}

	public isAllSelected(): boolean {
		const selectedTableItem = this.todayRatesTableSelection.selected;
		const selectedRate = _.first(selectedTableItem);

		if (_.isNil(selectedRate) || _.isNil(selectedRate?.currencyId)) {
			return false;
		}

		console.log("Current currencyId: " + selectedRate?.currencyId);

		if (!_.isNil(selectedRate.currencyId) && !_.isNil(selectedRate.abbreviation)) {
			this.store.dispatch(new SetActive(
				selectedRate.currencyId,
				selectedRate.abbreviation))
		}

		return selectedTableItem.length === this.todayRatesTableDataSource.data.length;
	}

	public masterToggle(): void {
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

	public getTodayCurrencyRates(): void {
		this.currencyRateProvider.getTodayCurrencies()
			.pipe(take(1))
			.subscribe((todayRates) => {
				this.upddateCurrencyStateStore(todayRates);
				this.todayCurrencyRates$.next(todayRates);
			});

		combineLatest([
			this.previousDayRates$,
			this.todayCurrencyRates$,
		])
			.pipe(take(1))
			.subscribe(([previousDayRates, todayRates]) => {
				todayRates.forEach((tr) => {
					const previousDateRate = previousDayRates
						.find((i) => i.currencyId == tr.currencyId);

					if (_.isNil(previousDateRate) || _.isNil(tr.ratePerUnit)) {
						return;
					}

					tr.currencyTrend = this.getTrend(
						tr.ratePerUnit,
						previousDateRate.ratePerUnit
					);

					tr.rateDiff = _.round(
						(tr.ratePerUnit - previousDateRate.ratePerUnit) / previousDateRate.ratePerUnit * 100,
						2)
						.toFixed(2);
				});
			});
	}

	public openGetCurrencyRatesDialog(): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.autoFocus = true;

		this.dialogProvider.openDialog(DateRangeDialogComponent, dialogConfig);
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
