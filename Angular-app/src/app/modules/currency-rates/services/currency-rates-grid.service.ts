import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Store } from '@ngxs/store';

import * as _ from 'lodash';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { CurrencyRateGroupModel } from '../../../../domain/models/rates/currency-rates-group.model';
import { AddCurrencyGroups, SetActiveCurrency } from './../../shared/store/actions/currency-rates.actions';
import { CurrencyRateGroup } from './../../shared/store/models/currency-rates/currency-rates-group';
import { CurrencyTrend } from './../../shared/store/models/currency-rates/currency-trend';
import { PreviousDayCurrencyRate } from './../../shared/store/models/currency-rates/previous-day-currency-rate';
import { CurrencyRate } from './../../shared/store/models/currency-rates/currency-rate';
import { RatesGridDefaultOptions } from './../../shared/constants/rates-grid-default-options';

@Injectable({
	providedIn: 'root',
})
export class CurrencyRatesGridService {

	constructor(private store: Store) {
	}

	public GetDataSource(
		rateGroups: CurrencyRateGroupModel[]
	): MatTableDataSource<UnifiedCurrencyRates> {
		const rates: UnifiedCurrencyRates[] = _.map(rateGroups, (rg) => this.mapToCurrencyRate(rg));

		return new MatTableDataSource<UnifiedCurrencyRates>(rates);
	}

	public GetTableSelection(rateGroups: CurrencyRateGroupModel[], currencyId: number): SelectionModel<UnifiedCurrencyRates> {

		const selectedGroups = _.filter(rateGroups, (rg: CurrencyRateGroupModel) => rg.currencyId === currencyId);
		const selectedValues = _.map(selectedGroups, gr => this.mapToCurrencyRate(gr));

		return new SelectionModel<UnifiedCurrencyRates>(false, selectedValues);
	}

	public syncWithRatesStore(todayRatesGroups: CurrencyRateGroupModel[]): void {
		this.store.dispatch(
			new AddCurrencyGroups(this.mapToCurrencyRateGroups(todayRatesGroups))
		);
	}

	public isAllCheckboxesSelected(selectedItems: UnifiedCurrencyRates[], supportedCurrenciesAmount: number): boolean {
		const selectedTableItem = selectedItems;
		const selectedRate = _.first(selectedTableItem);

		if (_.isNil(selectedRate) || _.isNil(selectedRate?.currencyId)) {
			return false;
		}

		console.log('Current currencyId: ' + selectedRate?.currencyId);

		if (
			!_.isNil(selectedRate.currencyId) &&
			!_.isNil(selectedRate.abbreviation)
		) {
			this.store.dispatch(
				new SetActiveCurrency(
					selectedRate.currencyId,
					selectedRate.abbreviation
				)
			);
		}

		return selectedTableItem.length === supportedCurrenciesAmount
	}

	public enrichWithTrend(
		previousDayRates: PreviousDayCurrencyRate[],
		todayRateGroups: CurrencyRateGroupModel[]): MatTableDataSource<UnifiedCurrencyRates> {
		todayRateGroups.forEach((rg) => {
			const previousDayRate = _.find(previousDayRates, r => r.currencyId === rg.currencyId);

			rg.rateValues = _.map(rg.rateValues, todayRate => <CurrencyRate>{
				ratePerUnit: todayRate.ratePerUnit,
				updateDate: todayRate.updateDate,
				currencyTrend: this.getTrend(todayRate.ratePerUnit, previousDayRate?.ratePerUnit),
				rateDiff: this.getRateDiff(previousDayRate?.ratePerUnit as number, 0 /* todayRate.ratePerUnit */)
			})
		});

		return this.GetDataSource(todayRateGroups);
	}

	private getRateDiff(previousDayRate: number, todayRate: number): string {
		if (_.isNil(previousDayRate)) {
			return 'N/A';
		}

		const diffAsPercentage = _.divide(_.subtract(todayRate, previousDayRate), previousDayRate) * 100;

		return _.round(diffAsPercentage, RatesGridDefaultOptions.RATE_DIFF_PRECISION).toString();
	}

	private getTrend(todayDayRate?: number, previousDayRate?: number): string {
		if (_.isNil(todayDayRate) || _.isNil(previousDayRate)) {
			return CurrencyTrend.notChanged;
		}

		if (todayDayRate === previousDayRate) {
			return CurrencyTrend.notChanged;
		}

		if (todayDayRate > previousDayRate) {
			return CurrencyTrend.up;
		}

		return CurrencyTrend.down;
	}

	private mapToCurrencyRate(rg: CurrencyRateGroupModel): UnifiedCurrencyRates {
		const todayRate = _.first(rg.rateValues);

		return new UnifiedCurrencyRates({
			currencyId: rg.currencyId,
			abbreviation: rg.abbreviation,
			scale: rg.scale,
			name: rg.name,
			rateDiff:  undefined /*todayRate?.rateDiff */,
			ratePerUnit: todayRate?.ratePerUnit,
			updateDate: todayRate?.updateDate,
			currencyTrend: undefined /* todayRate?.currencyTrend*/
		});
	}

	private mapToCurrencyRateGroups(
		todayRatesGroups: CurrencyRateGroupModel[]
	): CurrencyRateGroup[] {
		return _.map(
			todayRatesGroups,
			(rg) =>
			({
				currencyId: rg.currencyId,
				name: rg.name,
				abbreviation: rg.abbreviation,
				scale: rg.scale,
				currencyRates: rg.rateValues,
			} as CurrencyRateGroup)
		);
	}
}
