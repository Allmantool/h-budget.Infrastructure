import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import * as _ from 'lodash';
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexXAxis,
	ApexTitleSubtitle,
	ChartComponent,
} from 'ng-apexcharts';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { UnifiedCurrencyRates } from '../../currency-rates/models/unified-currency-rates';
import { NationalBankCurrencyProvider } from '../../currency-rates/providers/national-bank-currency.provider';
import { AddRange } from '../../shared/store/actions/currency-rates.actions';
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
	@Select(CurrencyRatesState.getCurrencyRatesByCurrencyId) rates$!: Observable<(id: number) => CurrencyRate[]>;

	@ViewChild('chart') chart!: ChartComponent;
	@Input() public currencyIsoCodeLabel = '';
	@Input() public currencyIsoCode: number = 431;

	@Input() public chartWidth = '550%';
	public chartOptions: ChartOptions = {} as ChartOptions;

	public isChartInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	public currencyRates$: Subject<UnifiedCurrencyRates[]> = new Subject<
		UnifiedCurrencyRates[]
	>();

	private subs: Subscription[] = [];

	constructor(
		private currencyRateProvider: NationalBankCurrencyProvider,
		private store: Store) { }

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	ngOnInit(): void {
		const getCurreyncy$ = this.currencyRateProvider
			.getCurrencies()
			.subscribe((rates) => {
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
				this.populateChartOptions();
			});

		if (getCurreyncy$) {
			this.subs.push(getCurreyncy$);
		}
	}

	private populateChartOptions(): void {
		this.rates$
			.pipe(
				filter(getCurrencies => !_.isEmpty(getCurrencies(this.currencyIsoCode))),
				take(1))
			.subscribe(data => {
				const rates = data(this.currencyIsoCode)
				this.chartOptions = {
					series: [
						{
							name: this.currencyIsoCodeLabel,
							data: _.map(
								rates,
								(r) => r.ratePerUnit ?? 0
							),
						},
					],
					chart: {
						height: '400',
						width: this.chartWidth,
						type: 'area',
					},
					title: {
						text: this.currencyIsoCodeLabel,
					},
					xaxis: {
						categories: _.map(rates, r => new Date(r.updateDate ?? Date.now()).toLocaleDateString()),
					},
				};

				this.isChartInitialized.next(true);
			});
	}
}
