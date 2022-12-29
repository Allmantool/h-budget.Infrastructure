import { Injectable } from '@angular/core';

import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, take } from 'rxjs/operators';
import * as _ from 'lodash';

import { RatesCodes } from '../../constants/rates-codes';
import {
	AddRange,
	FetchAllCurrencyRates,
	SetActive,
} from '../actions/currency-rates.actions';
import { CurrencyRate } from '../models/currency-rates/currency-rate';
import { NationalBankCurrencyProvider } from './../../../currency-rates/providers/national-bank-currency.provider';
import { CurrencyTableItem } from './../models/currency-rates/currency-table-item';
import { CurrencyTableOptions } from './../models/currency-rates/currency-table-options';
import { CurrencyRateGroup } from '../models/currency-rates/currency-rates-group';

export interface ICurrencyRatesStateModel {
	rateGroups: CurrencyRateGroup[];
	tableOptions: CurrencyTableOptions;
}

@State<ICurrencyRatesStateModel>({
	name: 'currencyRateState',
	defaults: {
		rateGroups: [],
		tableOptions: {
			selectedItem: {
				currencyId: RatesCodes.USA,
				abbreviation: 'USA',
			} as CurrencyTableItem,
		} as CurrencyTableOptions,
	},
})
@Injectable()
export class CurrencyRatesState {
	constructor(private currencyRateProvider: NationalBankCurrencyProvider) {}

	@Selector([CurrencyRatesState])
	static getRates(state: ICurrencyRatesStateModel): CurrencyRateGroup[] {
		return state.rateGroups;
	}

	@Selector([CurrencyRatesState])
	static getCurrencyRatesGroupByCurrencyId(
		state: ICurrencyRatesStateModel
	): (id: number) => CurrencyRateGroup {
		return (id: number) =>
			_.find(
				state.rateGroups,
				(r) => r.currencyId === id
			) as CurrencyRateGroup;
	}

	@Selector([CurrencyRatesState.getRates])
	static getCurrencyRatesFromPreviousDay(
		rates: CurrencyRate[]
	): CurrencyRate[] {
		const dates = _.chain(rates)
			.map((i) => i.updateDate)
			.uniqBy((i) => i)
			.value();
		const penultimateDate = dates[dates.length - 2];

		return _.filter(rates, (r) => r.updateDate === penultimateDate);
	}

	@Selector([CurrencyRatesState])
	static getCurrencyTableOptions(state: ICurrencyRatesStateModel) {
		return state.tableOptions;
	}

	@Action(FetchAllCurrencyRates)
	getAllCurrencyRates(ctx: StateContext<ICurrencyRatesStateModel>) {
		return this.currencyRateProvider.getCurrencies().pipe(
			take(1),
			tap((currencyRateGroups) =>
				ctx.patchState({
					rateGroups: _.map(
						currencyRateGroups,
						(rg) =>
							({
								currencyId: rg.currencyId,
								currencyRates: rg.rateValues,
							} as CurrencyRateGroup)
					),
				})
			)
		);
	}

	@Action(AddRange)
	addRange(
		{ getState, patchState }: StateContext<ICurrencyRatesStateModel>,
		{ addedRateGroups }: AddRange
	): void {
		const existedRateGroups = getState().rateGroups;
		const updatedCurrencyGroups = existedRateGroups.map((cg) => {
			const addingRates = addedRateGroups.find(
				(i) => i.currencyId == cg.currencyId
			)?.currencyRates;
			const ratesForUpdate = _.differenceWith(
				addingRates,
				cg.currencyRates,
				_.isEqual
			);
			const notUpdatedOrNewRates = _.filter(
				cg.currencyRates,
				(cgRate) =>
					!_.some(
						addingRates,
						(addRate) =>
							new Date(addRate.updateDate).toDateString() ===
							new Date(cgRate.updateDate).toDateString()
					)
			);

			const updatedCarrencyGroup = _.cloneDeep(cg);

			updatedCarrencyGroup.currencyRates = _.concat(
				notUpdatedOrNewRates,
				ratesForUpdate
			);

			return updatedCarrencyGroup;
		});

		patchState({
			rateGroups: _.isEmpty(updatedCurrencyGroups)
				? addedRateGroups
				: updatedCurrencyGroups,
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
					abbreviation: label,
				} as CurrencyTableItem,
			} as CurrencyTableOptions,
		});
	}
}
