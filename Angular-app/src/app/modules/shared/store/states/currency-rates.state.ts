import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import * as _ from 'lodash';

import { Add, Delete, AddRange } from '../actions/currency-rates.actions';
import { CurrencyRate } from '../models/currency-rate';

export interface ICurrencyRatesStateModel {
	rates: CurrencyRate[];
}

@State<ICurrencyRatesStateModel>({
	name: 'currencyRates',
	defaults: {
		rates: [],
	},
})
@Injectable()
export class CurrencyRatesState {
	@Selector()
	static getRates(state: ICurrencyRatesStateModel): CurrencyRate[] {
		return state.rates;
	}

	@Action(Add)
	add(
		{ getState, patchState }: StateContext<ICurrencyRatesStateModel>,
		{ rate }: Add
	): void {
		const state = getState();
		patchState({
			rates: [...state.rates, rate],
		});
	}

	@Action(AddRange)
	addRange(
		{ getState, patchState }: StateContext<ICurrencyRatesStateModel>,
		{ rates }: AddRange
	): void {
		const state = getState();
		patchState({
			rates: _.concat(state.rates, _.difference(rates, state.rates)),
		});
	}

	@Action(Delete)
	remove(
		{ getState, patchState }: StateContext<ICurrencyRatesStateModel>,
		{ currencyId, updateDate }: Delete
	): void {
		patchState({
			rates: getState().rates.filter(
				(r) => r.currencyId != currencyId && r.updateDate != updateDate
			),
		});
	}
}
