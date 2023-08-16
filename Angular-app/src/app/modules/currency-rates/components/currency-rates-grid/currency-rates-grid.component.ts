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
import { NationalBankCurrencyProvider } from '../../../../../data/providers/rates/national-bank-currency.provider';
import { CurrencyRate } from '../../../shared/store/models/currency-rates/currency-rate';
import {
	SetCurrencyDateRange,
} from '../../../shared/store/actions/currency-rates.actions';
import { CurrencyRatesState } from '../../../shared/store/states/currency-rates.state';
import { CurrencyTrend } from './../../../shared/store/models/currency-rates/currency-trend';
import { CurrencyTableOptions } from './../../../shared/store/models/currency-rates/currency-table-options';
import { CurrencyRateGroupModel } from '../../../../../domain/models/rates/currency-rates-group.model';
import { RatesDialogService } from './../../services/rates-dialog.service'
import { CurrencyRatesGridService } from '../../services/currency-rates-grid.service';
import { RatesGridDefaultOptions } from './../../../shared/constants/rates-grid-default-options';
import { PreviousDayCurrencyRate } from './../../../shared/store/models/currency-rates/previous-day-currency-rate';

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
	previousDayRates$!: Observable<PreviousDayCurrencyRate[]>;

	public trendRateLookup: { [trendDirection: string]: string } = {
		[CurrencyTrend.up]: 'LimeGreen',
		[CurrencyTrend.down]: 'crimson',
	};

	public selectedCurrencyPertionOption: number = RatesGridDefaultOptions.PERIOD_IN_MONTHS_AMMOUNT;

	public todayCurrencyRateGroups$: Subject<CurrencyRateGroupModel[]> =
		new Subject<CurrencyRateGroupModel[]>();

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
			.subscribe((todayRateGroups: CurrencyRateGroupModel[]) =>
				this.todayRatesTableDataSource = this.currencyRatesGridService.GetDataSource(todayRateGroups)
			);

		const getTableOptions$ = combineLatest([
			this.currencyTableOptions$,
			this.todayCurrencyRateGroups$,
		])
			.pipe(take(1))
			.subscribe(([tableOptions, rateGroups]) => {
				this.todayRatesTableSelection = this.currencyRatesGridService.GetTableSelection(rateGroups, tableOptions.selectedItem.currencyId)
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
				...this.todayRatesTableDataSource.data.filter(i => i?.currencyId as number === selectedCurrencyId)
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

		combineLatest([this.previousDayRates$, this.todayCurrencyRateGroups$, this.currencyTableOptions$])
			.pipe(take(1))
			.subscribe(([previousDayRates, todayRateGroups, tableOptions]) => {
				const dataSource = this.currencyRatesGridService.enrichWithTrend(previousDayRates, todayRateGroups);
				this.todayRatesTableDataSource = dataSource;

				this.masterToggle(tableOptions.selectedItem.currencyId);
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
