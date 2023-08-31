import { Injectable } from '@angular/core';

import { State, Action, StateContext } from '@ngxs/store';

import { ICurrencyChartStateModel } from './models/currency-chart-state.model';
import { CurrencyChartRange } from '../../models/currency-rates/currency-chart-range';
import { CurrencyChartOptions } from '../../models/currency-rates/currency-chart-option.';
import { SetSelectedCurrencyRange } from './actions/currency-chart-options.actions';

@State<ICurrencyChartStateModel>({
	name: 'currencyChartState',
	defaults: {
		chartOptions: {
			selectedRange: {
				start: 0,
				end: 0,
			} as CurrencyChartRange,
		} as CurrencyChartOptions,
	},
	children: [],
})
@Injectable()
export class CurrencyChartState {
	constructor() {}

	@Action(SetSelectedCurrencyRange)
	SetSelectedCurrencyRange(
		{ patchState }: StateContext<ICurrencyChartStateModel>,
		{ startValueIndex, endValueIndex }: SetSelectedCurrencyRange
	): void {
		patchState({
			chartOptions: {
				selectedRange: {
					start: startValueIndex,
					end: endValueIndex,
				} as CurrencyChartRange,
			} as CurrencyChartOptions,
		});
	}
}
