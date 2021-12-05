import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';

import {
	ApexAxisChartSeries,
	ApexChart,
	ApexXAxis,
	ApexTitleSubtitle,
	ChartComponent,
} from 'ng-apexcharts';
import { Subject, Subscription } from 'rxjs';
import { UnifiedCurrencyRates } from '../../currency-rates/models/unified-currency-rates';
import { NationalBankCurrencyProvider } from '../../currency-rates/providers/national-bank-currency.provider';

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
	@ViewChild('chart') chart!: ChartComponent;
	@Input() public currencyIsoCodeLabel = '';

	@Input() public chartWidth = '550%';
	public chartOptions: ChartOptions = {} as ChartOptions;

	public get isChartInitialized(): boolean {
		return !_.isEmpty(this.chartOptions);
	}

	public currencyRates$: Subject<UnifiedCurrencyRates[]> = new Subject<
		UnifiedCurrencyRates[]
	>();

	private subs: Subscription[] = [];

	constructor(private currencyRateProvider: NationalBankCurrencyProvider) {}

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	ngOnInit(): void {
		const getCurreyncy$ = this.currencyRateProvider
			.getCurrencies()
			.subscribe((rates) => this.populateChartOptions(rates));

		if (getCurreyncy$) {
			this.subs.push(getCurreyncy$);
		}
	}

	private populateChartOptions(rates: UnifiedCurrencyRates[]): void {
		this.chartOptions = {
			series: [
				{
					name: 'USD',
					data: _.map(
						rates.filter((r) => r.currencyId == 431),
						(r) => r.ratePerUnit ?? 0
					),
				},
			],
			chart: {
				height: '550',
				width: this.chartWidth,
				type: 'area',
			},
			title: {
				text: this.currencyIsoCodeLabel,
			},
			xaxis: {
				categories: _.map(
					_.groupBy(
						rates.filter((r) => r.currencyId == 431),
						(r) => new Date(r.updateDate ?? Date.now())
					),
					(i) =>
						new Date(
							i[0].updateDate ?? Date.now()
						).toLocaleDateString()
				),
			},
		};
	}
}
