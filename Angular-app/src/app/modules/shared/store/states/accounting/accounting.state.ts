import { Injectable } from '@angular/core';

import { Action, State, StateContext } from '@ngxs/store';
import * as _ from 'lodash';

import { AccountingTableState } from './accounting-table.state';
import { AddRange, Edit, Add, Delete } from './actions/accounting.actions';
import { IAccountingStateModel } from './models/accounting-state.model';
import { RatesAbbrevitions } from '../../../constants/rates-abbreviations';

@State<IAccountingStateModel>({
	name: 'accounting',
	defaults: {
		activeCurrency: RatesAbbrevitions.BYN,
		operationRecords: [],
	},
	children: [AccountingTableState],
})
@Injectable()
export class AccountingState {
	@Action(Add)
	add(
		{ getState, patchState }: StateContext<IAccountingStateModel>,
		{ accountingRecord }: Add
	): void {
		const state = getState();

		const records = _.orderBy(
			[...state.operationRecords, accountingRecord],
			['operationDate'],
			['asc']
		);

		patchState({
			operationRecords: records,
		});
	}

	@Action(AddRange)
	addRange(
		{ getState, patchState }: StateContext<IAccountingStateModel>,
		{ accountingRecord }: AddRange
	): void {
		const state = getState();
		patchState({
			operationRecords: _.concat(
				state.operationRecords,
				_.differenceWith(
					accountingRecord,
					state.operationRecords,
					_.isEqual.bind(this)
				)
			),
		});
	}

	@Action(Edit)
	edit(
		{ getState, patchState }: StateContext<IAccountingStateModel>,
		{ accountingRecord }: Edit
	): void {
		const records = [...getState().operationRecords];

		const updatedItemIndex = _.findIndex(
			records,
			(r) => r.id === accountingRecord.id
		);
		records.splice(updatedItemIndex, 1, accountingRecord);

		patchState({
			operationRecords: [
				..._.orderBy(records, ['operationDate'], ['asc']),
			],
		});
	}

	@Action(Delete)
	delete(
		{ getState, patchState }: StateContext<IAccountingStateModel>,
		{ accountingGuid }: Delete
	): void {
		const state = getState();

		const orderedRecords = _.chain(state.operationRecords)
			.filter(function (record) {
				return record.id !== accountingGuid;
			})
			.sortBy('operationDate')
			.value();

		patchState({
			operationRecords: [...orderedRecords],
		});
	}
}
