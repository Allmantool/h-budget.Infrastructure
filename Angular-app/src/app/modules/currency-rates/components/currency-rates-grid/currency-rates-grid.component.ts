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
	SetCurrencyDateRange,
} from '../../../shared/store/actions/currency-rates.actions';
import { CurrencyRatesState } from '../../../shared/store/states/currency-rates.state';
import { CurrencyTrend } from './../../../shared/store/models/currency-rates/currency-trend';
import { CurrencyTableOptions } from './../../../shared/store/models/currency-rates/currency-table-options';
import { NationalBankCurrencyRateGroup } from '../../models/currency-rates-group';
import { RatesDialogService } from './../../services/rates-dialog.service'
import { CurrencyRatesGridService } from '../../services/currency-rates-grid.service';
import { RatesGridDefaultOptions } from 'app/modules/shared/constants/rates-grid-default-options';

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

	public selectedCurrencyPertionOption: number = RatesGridDefaultOptions.PERIOD_IN_MONTHS_AMMOUNT;

	public todayCurrencyRateGroups$: Subject<NationalBankCurrencyRateGroup[]> =
		new Subject<NationalBankCurrencyRateGroup[]>();

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
		private store: Store,
		private ratesDialogService: RatesDialogService,
		private currencyRatesGridService: CurrencyRatesGridService
	) { }

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	ngOnInit(): void {
		
		const getRatesSub$ = this.todayCurrencyRateGroups$
			.pipe(take(1))
			.subscribe((rateGroups: NationalBankCurrencyRateGroup[]) =>
				this.todayRatesTableDataSource = this.currencyRatesGridService.GetDataSource(rateGroups)
			);

		const getTableOptions$ = combineLatest([
			this.currencyTableOptions$,
			this.todayCurrencyRateGroups$,
		])
			.pipe(take(1))
			.subscribe(([tableOptions, rateGroups]) => {
				this.todayRatesTableSelection = this.currencyRatesGridService.GetTableSelection(rateGroups, tableOptions.selectedItem.currencyId)
				this.masterToggle(tableOptions.selectedItem.currencyId);
				this.selectedCurrencyPertionOption = tableOptions.selectedDateRange.diffInMonths;
			});

		if (getRatesSub$) {
			this.subs.push(getRatesSub$);
			this.subs.push(getTableOptions$);
		}

		this.getTodayCurrencyRates();
	}

	public isAllSelected(): boolean {
		return this.currencyRatesGridService.isAllCheckboxesSelected(
			this.todayRatesTableSelection.selected,
			this.todayRatesTableDataSource.data.length);
	}

	public masterToggle(selectedCurrencyId: number): void {
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
				...this.todayRatesTableDataSource.data.filter(i => i.currencyId === selectedCurrencyId)
			);
		}
	}

	public getTodayCurrencyRates(): void {
		this.currencyRateProvider
			.getTodayCurrencies()
			.pipe(take(1))
			.subscribe((todayRatesGroups) => {
				this.currencyRatesGridService.syncWithRatesStore(todayRatesGroups);

				this.todayCurrencyRateGroups$.next(todayRatesGroups);
			});

		combineLatest([this.previousDayRates$, this.todayCurrencyRateGroups$])
			.pipe(take(1))
			.subscribe(([previousDayRates, todayRates]) => {
				todayRates.forEach((tr) => { });
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
}
