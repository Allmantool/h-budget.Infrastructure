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
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { UnifiedCurrencyRates } from '../../currency-rates/models/unified-currency-rates';
import { FetchAllCurrencyRates } from '../../shared/store/actions/currency-rates.actions';
import { CurrencyRate } from '../../shared/Store/models/currency-rate';
import { CurrencyRatesState } from '../../shared/store/states/currency-rates.state';

export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	title: ApexTitleSubtitle;
};

@Component({
	selector: 'app-currency-rates-line-chart',
	templateUrl: './currency-rates-line-chart.component.html',
	styleUrls: ['./currency-rates-line-chart.component.css'],
})
export class CurrencyRatesLineChartComponent implements OnInit, OnDestroy {
	@Select(CurrencyRatesState.getCurrencyRatesByCurrencyId)
	rates$!: Observable<(id: number) => CurrencyRate[]>;

	@ViewChild('chart') chart!: ChartComponent;
	@Input() public currencyIsoCodeLabel = '';
	@Input() public currencyIsoCode = 431;

	@Input() public chartWidth = '500%';
	@Input() public chartHeight = '360';
	public chartOptions: ChartOptions = {} as ChartOptions;

	public isChartInitialized: BehaviorSubject<boolean> =
		new BehaviorSubject<boolean>(false);

	public currencyRates$: Subject<UnifiedCurrencyRates[]> = new Subject<
		UnifiedCurrencyRates[]
	>();

	private subs: Subscription[] = [];

	constructor(private store: Store) {}

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	ngOnInit(): void {
		this.store.dispatch(new FetchAllCurrencyRates());
		this.populateChartOptions();
	}

	private populateChartOptions(): void {
		this.subs.push(
			this.rates$
				.pipe(
					filter(
						(getCurrencies) =>
							!_.isEmpty(getCurrencies(this.currencyIsoCode))
					)
				)
				.subscribe((data) => {
					const rates = data(this.currencyIsoCode);
					this.chartOptions = {
						series: [
							{
								name: this.currencyIsoCodeLabel,
								data: _.map(rates, (r) => r.ratePerUnit ?? 0),
							},
						],
						chart: {
							height: this.chartHeight,
							width: this.chartWidth,
							type: 'area',
						},
						title: {
							text: this.currencyIsoCodeLabel,
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
