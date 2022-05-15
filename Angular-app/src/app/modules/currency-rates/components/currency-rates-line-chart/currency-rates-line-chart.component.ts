import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { format } from 'date-fns';
import * as _ from 'lodash';
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexXAxis,
	ApexTitleSubtitle,
	ChartComponent,
} from 'ng-apexcharts';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FetchAllCurrencyRates } from './../../../shared/store/actions/currency-rates.actions';
import { CurrencyRate } from '../../../shared/store/models/currency-rates/currency-rate';
import { CurrencyTableOptions } from './../../../shared/store/models/currency-rates/currency-table-options';
import { CurrencyRatesState } from './../../../shared/store/states/currency-rates.state';
import { UnifiedCurrencyRates } from './../../models/unified-currency-rates';


export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	title: ApexTitleSubtitle;
};

@Component({
	selector: 'currency-rates-line-chart',
	templateUrl: './currency-rates-line-chart.component.html',
	styleUrls: ['./currency-rates-line-chart.component.css'],
})
export class CurrencyRatesLineChartComponent implements OnInit, OnDestroy {
	@Select(CurrencyRatesState.getCurrencyRatesByCurrencyId)
	rates$!: Observable<(id: number) => CurrencyRate[]>;

	@Select(CurrencyRatesState.getCurrencyTableOptions)
	currencyTableOptions$!: Observable<CurrencyTableOptions>;

	@ViewChild('chart') chart!: ChartComponent;

	@Input() public chartWidth = '500%';
	@Input() public chartHeight = '360';
	public chartOptions: ChartOptions = {} as ChartOptions;

	public isChartInitialized: BehaviorSubject<boolean> =
		new BehaviorSubject<boolean>(false);

	public currencyRates$: Subject<UnifiedCurrencyRates[]> = new Subject<
		UnifiedCurrencyRates[]
	>();

	private subs: Subscription[] = [];

	constructor(private store: Store) { }

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	ngOnInit(): void {
		this.store.dispatch(new FetchAllCurrencyRates());
		this.populateChartOptions();
	}

	private populateChartOptions(): void {
		this.subs.push(
			combineLatest([
				this.rates$,
				this.currencyTableOptions$
			]).pipe(
				filter(([getCurrencies, tableOptions]) => !_.isEmpty(getCurrencies(tableOptions.selectedItem.currencyId)))
			)
				.subscribe(([data, tableOptions]) => {
					const rates = data(tableOptions.selectedItem.currencyId);
					this.chartOptions = {
						series: [
							{
								name: tableOptions.selectedItem.abbreviation,
								data: _.map(rates, (r) => r.ratePerUnit ?? 0),
							},
						],
						chart: {
							height: this.chartHeight,
							width: this.chartWidth,
							type: 'area',
						},
						title: {
							text: tableOptions.selectedItem.abbreviation,
						},
						xaxis: {
							categories: _.map(rates, (r) =>
								format(new Date(r.updateDate), "dd MMM yy")
							),
						},
					};

					this.isChartInitialized.next(true);
				})
		);
	}
}
