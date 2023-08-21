import { Injectable } from '@angular/core';

import { addMonths } from 'date-fns';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, take } from 'rxjs/operators';
import * as _ from 'lodash';

import {
	AddCurrencyGroups,
	FetchAllCurrencyRates,
	SetActiveCurrency,
	SetCurrencyDateRange,
} from '../actions/currency-rates.actions';
import { NationalBankCurrencyProvider } from '../../../../../data/providers/rates/national-bank-currency.provider';
import { CurrencyTableItem } from './../models/currency-rates/currency-table-item';
import { CurrencyTableOptions } from './../models/currency-rates/currency-table-options';
import { CurrencyDateRange } from '../models/currency-rates/currency-date-range';
import { RatesGridDefaultOptions } from '../../constants/rates-grid-default-options';
import { PreviousDayCurrencyRate } from '../models/currency-rates/previous-day-currency-rate';
import { CurrencyRateValueModel } from 'domain/models/rates/currency-rate-value.model';
import { CurrencyRateGroupModel } from 'domain/models/rates/currency-rates-group.model';

export interface ICurrencyRatesStateModel {
	rateGroups: CurrencyRateGroupModel[];
	tableOptions: CurrencyTableOptions;
}

@State<ICurrencyRatesStateModel>({
	name: 'currencyRateState',
	defaults: {
		rateGroups: [],
		tableOptions: {
			selectedItem: {
				currencyId: RatesGridDefaultOptions.CURRENCY_ID,
				abbreviation: RatesGridDefaultOptions.CURRENCY_ABBREVIATION,
			} as CurrencyTableItem,
			selectedDateRange: {
				start: addMonths(
					new Date(),
					-RatesGridDefaultOptions.PERIOD_IN_MONTHS_AMMOUNT
				),
				end: new Date(),
				diffInMonths: RatesGridDefaultOptions.PERIOD_IN_MONTHS_AMMOUNT,
			} as CurrencyDateRange,
		} as CurrencyTableOptions,
	},
})
@Injectable()
export class CurrencyRatesState {
	constructor(private currencyRateProvider: NationalBankCurrencyProvider) {}

	@Selector([CurrencyRatesState])
	static getRates(state: ICurrencyRatesStateModel): CurrencyRateGroupModel[] {
		return state.rateGroups;
	}

	@Selector([CurrencyRatesState])
	static getCurrencyRatesGroupByCurrencyId(
		state: ICurrencyRatesStateModel
	): (id: number) => CurrencyRateGroupModel {
		return (id: number) =>
			_.find(
				state.rateGroups,
				(r) => r.currencyId === id
			) as CurrencyRateGroupModel;
	}

	@Selector([CurrencyRatesState.getRates])
	static getCurrencyRatesFromPreviousDay(
		rateGroups: CurrencyRateGroupModel[]
	): PreviousDayCurrencyRate[] {
		const previousDayRates = _.chain(rateGroups)
			.map((rg: CurrencyRateGroupModel) => {
				const orderedRates = _.orderBy(
					rg.rateValues,
					(r) => r.updateDate,
					['desc']
				);

				const previousDayRates = orderedRates[1] ?? orderedRates[0];

				return <PreviousDayCurrencyRate>{
					currencyId: rg.currencyId,
					ratePerUnit: previousDayRates?.ratePerUnit,
					updateDate: previousDayRates?.updateDate,
				};
			})
			.value();

		return previousDayRates;
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
								name: rg.name,
								abbreviation: rg.abbreviation,
								scale: rg.scale,
								rateValues: _.orderBy(
									rg.rateValues,
									(i) => i.updateDate
								),
							}) as CurrencyRateGroupModel
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
			const addingRates: CurrencyRateValueModel[] = addedRateGroups.find(
				(i) => i.currencyId == cg.currencyId
			)?.rateValues!;

			const ratesForUpdate = _.differenceWith(
				addingRates,
				cg.rateValues!,
				_.isEqual
			);

			if (_.isNil(ratesForUpdate) || _.isEmpty(ratesForUpdate)) {
				return cg;
			}

			const notUpdatedOrNewRates = _.filter(
				cg.rateValues,
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

			updatedCarrencyGroup.rateValues = _.orderBy(
				upToDateRates,
				(r) => r.updateDate
			);

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
					end: new Date(),
					diffInMonths: amountOfMonths,
				} as CurrencyDateRange,
			} as CurrencyTableOptions,
		});
	}
}
