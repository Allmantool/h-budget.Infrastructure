/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@angular/core';

import { format } from 'date-fns';
import * as _ from 'lodash';
import { Store } from '@ngxs/store';

import { ChartOptions } from '../components/currency-rates-line-chart/currency-rates-line-chart.component';
import { LineChartOptions } from '../models/line-chart-options';
import { CurrencyTableOptions } from 'app/modules/shared/store/models/currency-rates/currency-table-options';
import { CurrencyRateValueModel } from 'domain/models/rates/currency-rate-value.model';
import { SetSelectedCurrencyRange } from '../../../app/modules/shared/store/states/rates/actions/currency-chart-options.actions';

@Injectable()
export class LineChartService {
	constructor(protected readonly store: Store) {}

	public getChartOptions(
		rates: CurrencyRateValueModel[],
		tableOptions: CurrencyTableOptions,
		options: LineChartOptions
	): ChartOptions {
		const ratesFilterByDateRange = _.sortBy(rates, (i) => i.updateDate);

		const selectedDateRange = tableOptions.selectedDateRange;

		const ratesForPeriod = _.filter(
			ratesFilterByDateRange,
			(r) =>
				r.updateDate! >= selectedDateRange.start &&
				r.updateDate! <= selectedDateRange.end
		);

		const abbreviation = tableOptions.selectedItem.abbreviation;

		return {
			series: [
				{
					name: abbreviation,
					data: _.map(ratesForPeriod, (r) => r.ratePerUnit ?? 0),
				},
			],
			chart: {
				events: {
					zoomed: (_, { xaxis }) => {
						this.store.dispatch(
							new SetSelectedCurrencyRange(
								xaxis.min - 1,
								xaxis.max
							)
						);
					},
				},
				height: options.height,
				width: options.width,
				type: options.type,
			},
			title: {
				text: abbreviation,
			},
			xaxis: {
				categories: _.map(ratesForPeriod, (r) =>
					format(r.updateDate!, options.dateFormat)
				),
			},
		};
	}
}
