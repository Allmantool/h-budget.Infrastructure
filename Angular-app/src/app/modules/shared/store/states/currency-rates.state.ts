import { Injectable } from '@angular/core';

import { addMonths } from 'date-fns';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, take } from 'rxjs/operators';
import * as _ from 'lodash';

import { RatesCodes } from '../../constants/rates-codes';
import {
	AddCurrencyGroups,
	FetchAllCurrencyRates,
	SetActiveCurrency,
	SetCurrencyDateRange,
} from '../actions/currency-rates.actions';
import { CurrencyRate } from '../models/currency-rates/currency-rate';
import { NationalBankCurrencyProvider } from './../../../currency-rates/providers/national-bank-currency.provider';
import { CurrencyTableItem } from './../models/currency-rates/currency-table-item';
import { CurrencyTableOptions } from './../models/currency-rates/currency-table-options';
import { CurrencyRateGroup } from '../models/currency-rates/currency-rates-group';
import { CurrencyDateRange } from '../models/currency-rates/currency-date-range';

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
			selectedDateRange: {
				start: addMonths(new Date(), -3),
				end: new Date()
			} as CurrencyDateRange
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
	fetchAllCurrencyRates(ctx: StateContext<ICurrencyRatesStateModel>) {
		return this.currencyRateProvider.getCurrencies().pipe(
			take(1),
			tap((currencyRateGroups) =>
				ctx.patchState({
					rateGroups: _.map(
						currencyRateGroups,
						(rg) =>
							({
								currencyId: rg.currencyId,
								currencyRates: _.orderBy(rg.rateValues, i => i.updateDate),
							} as CurrencyRateGroup)
					),
				})
			)
		);
	}

	@Action(AddCurrencyGroups)
	addCurrencyGroups(
		{ getState, patchState }: StateContext<ICurrencyRatesStateModel>,
		{ addedRateGroups }: AddCurrencyGroups
	): void {
		const ratesFromTheState = getState().rateGroups;

		const upToDateCurrencyGroups = ratesFromTheState.map((cg) => {

			const addingRates = addedRateGroups.find(
				(i) => i.currencyId == cg.currencyId
			)?.currencyRates;

			const ratesForUpdate = _.differenceWith(
				addingRates,
				cg.currencyRates,
				_.isEqual
			);

			if (_.isNil(ratesForUpdate) || _.isEmpty(ratesForUpdate)) {
				return cg;
			}

			const notUpdatedOrNewRates = _.filter(
				cg.currencyRates,
				(cgRate) =>
					!_.some(
						addingRates,
						(addRate) => addRate.updateDate === cgRate.updateDate
					)
			);

			const updatedCarrencyGroup = _.cloneDeep(cg);

			const upToDateRates = _.concat(
				notUpdatedOrNewRates,
				ratesForUpdate
			);

			updatedCarrencyGroup.currencyRates = _.orderBy(upToDateRates, r => r.updateDate);

			return updatedCarrencyGroup;
		});

		patchState({
			rateGroups: _.isEmpty(upToDateCurrencyGroups)
				? addedRateGroups
				: upToDateCurrencyGroups,
		});
	}

	@Action(SetActiveCurrency)
	setActiveCurrency(
		{ getState, patchState }: StateContext<ICurrencyRatesStateModel>,
		{ id, label }: SetActiveCurrency
	): void {
		patchState({
			tableOptions: {
				selectedItem: {
					currencyId: id,
					abbreviation: label,
				} as CurrencyTableItem,
				selectedDateRange: getState().tableOptions.selectedDateRange,
			} as CurrencyTableOptions,
		});
	}

	@Action(SetCurrencyDateRange)
	setCurrencyDateRange(
		{ getState, patchState }: StateContext<ICurrencyRatesStateModel>,
		{ amountOfMonths }: SetCurrencyDateRange
	): void {
		patchState({
			tableOptions: {
				selectedItem: getState().tableOptions.selectedItem,
				selectedDateRange: {
					start: addMonths(new Date(), -amountOfMonths),
					end: new Date()
				} as CurrencyDateRange,
			} as CurrencyTableOptions,
		});
	}
}
