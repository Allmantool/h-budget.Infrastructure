import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import * as _ from 'lodash';

import { UnifiedCurrencyRates } from '../../models/unified-currency-rates';
import { NationalBankCurrencyProvider } from '../../providers/national-bank-currency.provider';
import { CurrencyRate } from '../../../shared/store/models/currency-rates/currency-rate';
import {
	AddCurrencyGroups,
	SetActiveCurrency,
	SetCurrencyDateRange,
} from '../../../shared/store/actions/currency-rates.actions';
import { CurrencyRatesState } from '../../../shared/store/states/currency-rates.state';
import { CurrencyTrend } from './../../../shared/store/models/currency-rates/currency-trend';
import { CurrencyTableOptions } from './../../../shared/store/models/currency-rates/currency-table-options';
import { NationalBankCurrencyRateGroup } from '../../models/currency-rates-group';
import { CurrencyRateGroup } from './../../../shared/store/models/currency-rates/currency-rates-group';
import { RatesDialogService } from './../../services/rates-dialog.service'

@Component({
	selector: 'app-currency-rates-grid',
	templateUrl: './currency-rates-grid.component.html',
	styleUrls: ['./currency-rates-grid.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatesGridComponent implements OnInit, OnDestroy {
	@Select(CurrencyRatesState.getRates) rates$!: Observable<CurrencyRate[]>;
	@Select(CurrencyRatesState.getCurrencyTableOptions)
	currencyTableOptions$!: Observable<CurrencyTableOptions>;
	@Select(CurrencyRatesState.getCurrencyRatesFromPreviousDay)
	previousDayRates$!: Observable<CurrencyRate[]>;

	public trendRateLookup: { [trendDirection: string]: string } = {
		[CurrencyTrend.up]: 'chartreuse',
		[CurrencyTrend.down]: 'crimson',
	};

	public todayCurrencyRateGroups$: Subject<NationalBankCurrencyRateGroup[]> =
		new Subject<NationalBankCurrencyRateGroup[]>();

	public todayRatesTableDataSource =
		new MatTableDataSource<UnifiedCurrencyRates>([]);
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
		private store: Store,
        private ratesDialogService: RatesDialogService
	) {}

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	ngOnInit(): void {
		const getRatesSub$ = this.todayCurrencyRateGroups$
			.pipe(take(1))
			.subscribe(
				(rates) =>
					(this.todayRatesTableDataSource =
						new MatTableDataSource<UnifiedCurrencyRates>(rates))
			);

		const getTableOptions$ = combineLatest([
			this.currencyTableOptions$,
			this.todayCurrencyRateGroups$,
		])
			.pipe()
			.subscribe(([tableOptions, todayRates]) => {
				this.todayRatesTableSelection =
					new SelectionModel<UnifiedCurrencyRates>(
						false,
						todayRates.filter(
							(i) =>
								i.currencyId ==
								tableOptions.selectedItem.currencyId
						)
					);
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

		console.log('Current currencyId: ' + selectedRate?.currencyId);

		if (
			!_.isNil(selectedRate.currencyId) &&
			!_.isNil(selectedRate.abbreviation)
		) {
			this.store.dispatch(
				new SetActiveCurrency(
					selectedRate.currencyId,
					selectedRate.abbreviation
				)
			);
		}

		return (
			selectedTableItem.length ===
			this.todayRatesTableDataSource.data.length
		);
	}

	public masterToggle(): void {
		const isAllSelected: boolean = this.isAllSelected();

		if (
			isAllSelected &&
			this.todayRatesTableSelection.selected.length === 1
		) {
			return;
		}

		const currencyRatesForselectByDefault: UnifiedCurrencyRates =
			this.todayRatesTableDataSource.data[0];

		if (isAllSelected) {
			this.todayRatesTableSelection.clear();
			this.todayRatesTableSelection.select(
				currencyRatesForselectByDefault
			);
		} else {
			this.todayRatesTableSelection.select(
				...this.todayRatesTableDataSource.data
			);
		}
	}

	public getTodayCurrencyRates(): void {
		this.currencyRateProvider
			.getTodayCurrencies()
			.pipe(take(1))
			.subscribe((todayRatesGroups) => {
				this.upddateCurrencyStateStore(todayRatesGroups);
				this.todayCurrencyRateGroups$.next(todayRatesGroups);
			});

		combineLatest([this.previousDayRates$, this.todayCurrencyRateGroups$])
			.pipe(take(1))
			.subscribe(([previousDayRates, todayRates]) => {
				todayRates.forEach((tr) => {});
			});
	}

	public openGetCurrencyRatesDialog(): void {
        this.ratesDialogService.openLoadRatesForPeriod();
	}

	public setDateRange(monthsAmount: number): void {
		this.store.dispatch(
			new SetCurrencyDateRange(monthsAmount)
		);
	}

	private upddateCurrencyStateStore(
		todayRates: NationalBankCurrencyRateGroup[]
	): void {
		this.store.dispatch(
			new AddCurrencyGroups(this.mapToCurrencyRateGroups(todayRates))
		);
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

	private mapToCurrencyRateGroups(
		todayRatesGroups: NationalBankCurrencyRateGroup[]
	): CurrencyRateGroup[] {
		return _.map(
			todayRatesGroups,
			(rg) =>
				({
					currencyId: rg.currencyId,
                    name: rg.name,
                    abbreviation: rg.abbreviation,
                    scale: rg.scale,
					currencyRates: rg.rateValues,
				} as CurrencyRateGroup)
		);
	}
}
