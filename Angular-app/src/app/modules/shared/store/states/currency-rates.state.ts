import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { differenceInDays } from 'date-fns';
import * as _ from 'lodash';
import { tap } from 'rxjs/operators';

import { NationalBankCurrencyProvider } from 'src/app/modules/currency-rates/providers/national-bank-currency.provider';
import {
	Add,
	Delete,
	AddRange,
	FetchAllCurrencyRates,
} from '../actions/currency-rates.actions';
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
	constructor(private currencyRateProvider: NationalBankCurrencyProvider) { }

	@Selector([CurrencyRatesState])
	static getRates(state: ICurrencyRatesStateModel): CurrencyRate[] {
		return state.rates;
	}

	@Selector([CurrencyRatesState])
	static getCurrencyRatesByCurrencyId(
		state: ICurrencyRatesStateModel
	): (id: number) => CurrencyRate[] {
		return (id: number) =>
			_.filter(state.rates, (r) => r.currencyId === id);
	}

	@Selector([CurrencyRatesState.getRates])
	static getCurrencyRatesFromPreviousDay(
		state: ICurrencyRatesStateModel
	): CurrencyRate[] {
		return _.filter(
			state.rates,
			(r) => differenceInDays(new Date(_.now()), new Date(r.updateDate)) === 1
		);
	}

	@Action(FetchAllCurrencyRates)
	getAllCurrencyRates(ctx: StateContext<ICurrencyRatesStateModel>) {
		return this.currencyRateProvider.getCurrencies().pipe(
			tap((unifiedRates) => {
				const rates: CurrencyRate[] = _.map(
					unifiedRates,
					(r) =>
					({
						currencyId: r.currencyId,
						updateDate: r.updateDate,
						ratePerUnit: r.ratePerUnit,
					} as CurrencyRate)
				);

				ctx.patchState({ rates });
			})
		);
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
			rates: _.concat(
				state.rates,
				_.differenceWith(rates, state.rates, _.isEqual)
			),
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
