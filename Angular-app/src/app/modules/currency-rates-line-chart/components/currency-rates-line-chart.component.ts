import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

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
	public chartOptions: ChartOptions;

	public currencyRates$: Subject<UnifiedCurrencyRates[]> = new Subject<
		UnifiedCurrencyRates[]
	>();

	private subs: Subscription[] = [];

	constructor(private currencyRateProvider: NationalBankCurrencyProvider) {
		this.chartOptions = {} as ChartOptions;
	}

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	ngOnInit(): void {
		const getCurreyncy$ = this.currencyRateProvider
			.getCurrencies()
			.subscribe(
				(r) =>
					(this.chartOptions = {
						series: [
							{
								name: 'My-series',
								data: [
									2.6, 2.54, 2.55, 2.57, 2.62, 2.48, 2.45,
									2.42, 2.38,
								],
							},
							{
								name: 'My-series-2',
								data: [
									3.6, 3.54, 2.55, 3.57, 3.62, 4.48, 3.45,
									2.42, 4.38,
								],
							},
						],
						chart: {
							height: '200',
							width: '350%',
							type: 'area',
						},
						title: {
							text: this.currencyIsoCodeLabel,
						},
						xaxis: {
							categories: [
								'Jan',
								'Feb',
								'Mar',
								'Apr',
								'May',
								'Jun',
								'Jul',
								'Aug',
								'Sep',
							],
						},
					})
			);

		if (getCurreyncy$) {
			this.subs.push(getCurreyncy$);
		}
	}
}
