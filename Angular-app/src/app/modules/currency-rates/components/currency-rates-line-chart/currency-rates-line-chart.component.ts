import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';

import * as _ from 'lodash';
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexXAxis,
	ApexTitleSubtitle,
	ChartComponent,
} from 'ng-apexcharts';
import {
	BehaviorSubject,
	combineLatest,
	Observable,
	Subject,
	Subscription,
} from 'rxjs';
import { filter } from 'rxjs/operators';

import { FetchAllCurrencyRates } from './../../../shared/store/actions/currency-rates.actions';
import { CurrencyTableOptions } from './../../../shared/store/models/currency-rates/currency-table-options';
import { CurrencyRatesState } from './../../../shared/store/states/currency-rates.state';
import { UnifiedCurrencyRates } from './../../models/unified-currency-rates';
import { CurrencyRateGroup } from './../../../shared/store/models/currency-rates/currency-rates-group';
import { LineChartService } from '../../services/line-chart.service';
import { LineChartOptions } from '../../models/line-chart-options';

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
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatesLineChartComponent implements OnInit, OnDestroy {
	@Select(CurrencyRatesState.getCurrencyRatesGroupByCurrencyId)
	ratesGroup$!: Observable<(id: number) => CurrencyRateGroup>;

	@Select(CurrencyRatesState.getCurrencyTableOptions)
	currencyTableOptions$!: Observable<CurrencyTableOptions>;

	@ViewChild('chart') chart!: ChartComponent;

	@Input() public chartWidth = '500%';
	@Input() public chartHeight = '360';
	public chartOptions: ChartOptions = {} as ChartOptions;

	public isChartInitialized$: BehaviorSubject<boolean> =
		new BehaviorSubject<boolean>(false);

	public currencyRates$: Subject<UnifiedCurrencyRates[]> = new Subject<
		UnifiedCurrencyRates[]
	>();

	private subs: Subscription[] = [];

	constructor(private store: Store, private linechartService: LineChartService) { }

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	ngOnInit(): void {
		this.store.dispatch(new FetchAllCurrencyRates());
		this.populateChartOptions();
	}

	private populateChartOptions(): void {
		this.subs.push(
			combineLatest([this.ratesGroup$, this.currencyTableOptions$])
				.pipe(
					filter(
						([getCurrencies, tableOptions]) =>
							!_.isEmpty(
								getCurrencies(
									tableOptions.selectedItem.currencyId
								)?.currencyRates
							)
					)
				)
				.subscribe(([data, tableOptions]) => {

					const rates = data(
						tableOptions.selectedItem.currencyId
					)?.currencyRates;

					const lineChartOptions: LineChartOptions = ({
						height: this.chartHeight,
						width: this.chartWidth,
						dateFormat: 'dd MMM yy',
						type: 'area'
					});

					this.chartOptions = this.linechartService.getChartOptions(rates, tableOptions, lineChartOptions);

					this.isChartInitialized$.next(true);
				})
		);
	}
}
