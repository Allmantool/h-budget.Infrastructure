import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { Mapper } from '@dynamic-mapper/angular';
import { Store } from '@ngxs/store';
import * as _ from 'lodash';

import { CurrencyGridRateModel } from '../models/currency-grid-rate.model';
import { CurrencyRateGroupModel } from 'domain/models/rates/currency-rates-group.model';
import { AddCurrencyGroups, SetActiveCurrency } from 'app/modules/shared/store/actions/currency-rates.actions';
import { PreviousDayCurrencyRate } from 'app/modules/shared/store/models/currency-rates/previous-day-currency-rate';
import { CurrencyRate } from 'app/modules/shared/store/models/currency-rates/currency-rate';
import { RatesGridDefaultOptions } from 'app/modules/shared/constants/rates-grid-default-options';
import { CurrencyTrend } from 'app/modules/shared/store/models/currency-rates/currency-trend';
import { CurrencyRateGroup } from 'app/modules/shared/store/models/currency-rates/currency-rates-group';
import { PresentationRatesMappingProfile } from '../mappers/presentation-rates-mapping.profiler';

@Injectable()
export class CurrencyRatesGridService {

	constructor(
		private mapper: Mapper,
		private store: Store) {
	}

	public GetDataSource(
		rateGroups: CurrencyRateGroupModel[]
	): MatTableDataSource<CurrencyGridRateModel> {

		const source = this.mapper.map(PresentationRatesMappingProfile.CurrencyRateGroupModelToGridRates, rateGroups);

		return new MatTableDataSource<CurrencyGridRateModel>(source);
	}

	public GetTableSelection(rateGroups: CurrencyRateGroupModel[], currencyId: number): SelectionModel<CurrencyGridRateModel> {

		const selectedGroups = _.filter(rateGroups, (rg: CurrencyRateGroupModel) => rg.currencyId === currencyId);

		const source = this.mapper.map(PresentationRatesMappingProfile.CurrencyRateGroupModelToGridRates, selectedGroups);

		return new SelectionModel<CurrencyGridRateModel>(false, source);
	}

	public syncWithRatesStore(todayRatesGroups: CurrencyRateGroupModel[]): void {
		this.store.dispatch(
			new AddCurrencyGroups(this.mapToCurrencyRateGroups(todayRatesGroups))
		);
	}

	public isAllCheckboxesSelected(selectedItems: CurrencyGridRateModel[], supportedCurrenciesAmount: number): boolean {
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
		todayRateGroups: CurrencyRateGroupModel[]): MatTableDataSource<CurrencyGridRateModel> {

		todayRateGroups.forEach((rg) => {
			const previousDayRate = _.find(previousDayRates, r => r.currencyId === rg.currencyId);

			rg.rateValues = _.map(rg.rateValues, todayRate => <CurrencyRate>{
				ratePerUnit: todayRate.ratePerUnit,
				updateDate: todayRate.updateDate,
				currencyTrend: this.getTrend(todayRate.ratePerUnit, previousDayRate?.ratePerUnit),
				rateDiff: this.getRateDiff(previousDayRate?.ratePerUnit as number, todayRate.ratePerUnit ?? 0 )
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
