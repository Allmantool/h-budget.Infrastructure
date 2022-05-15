import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import * as _ from 'lodash';
import { tap } from 'rxjs/operators';

import { RatesCodes } from '../../constants/rates-codes';
import {
	Add,
	Delete,
	AddRange,
	FetchAllCurrencyRates,
	SetActive,
} from '../actions/currency-rates.actions';
import { CurrencyRate } from '../models/currency-rates/currency-rate';
import { NationalBankCurrencyProvider } from './../../../currency-rates/providers/national-bank-currency.provider';
import { CurrencyTableItem } from './../models/currency-rates/currency-table-item';
import { CurrencyTableOptions } from './../models/currency-rates/currency-table-options';

export interface ICurrencyRatesStateModel {
	rates: CurrencyRate[];
	tableOptions: CurrencyTableOptions;
}

@State<ICurrencyRatesStateModel>({
	name: 'currencyRates',
	defaults: {
		rates: [],
		tableOptions: {
			selectedItem: {
				currencyId: RatesCodes.USA,
				abbreviation: "USA"
			} as CurrencyTableItem
		} as CurrencyTableOptions
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
		const dates = _.chain(state.rates).map(i => i.updateDate).uniqBy(i => i).value();
		const previousDayDate = dates[dates.length - 2];

		return _.filter(
			state.rates,
			(r) => r.updateDate === previousDayDate
		);
	}

	@Selector([CurrencyRatesState])
	static getCurrencyTableOptions(state: ICurrencyRatesStateModel) {
		return state.tableOptions;
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

	@Action(SetActive)
	setActive(
		{ patchState }: StateContext<ICurrencyRatesStateModel>,
		{ id, label }: SetActive
	): void {
		patchState({
			tableOptions: {
				selectedItem: {
					currencyId: id,
					abbreviation: label
				} as CurrencyTableItem
			} as CurrencyTableOptions
		});
	}
}
