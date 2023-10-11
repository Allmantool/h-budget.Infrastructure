import { Injectable } from '@angular/core';

import { Action, State, StateContext } from '@ngxs/store';
import * as _ from 'lodash';
import { nameof } from 'ts-simple-nameof';

import { AccountingTableState } from './accounting-table.state';
import { AddRange, Edit, Add, Delete } from './actions/accounting.actions';
import { IAccountingStateModel } from './models/accounting-state.model';
import { CurrencyAbbrevitions } from '../../../constants/rates-abbreviations';
import { AccountingGridRecord } from '../../../../../../presentation/accounting/models/accounting-grid-record';

@State<IAccountingStateModel>({
	name: 'accounting',
	defaults: {
		activeCurrency: CurrencyAbbrevitions.BYN,
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
			[nameof<AccountingGridRecord>((r) => r.operationDate)],
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

		const records = _.concat(
			state.operationRecords,
			_.differenceWith(
				accountingRecord,
				state.operationRecords,
				_.isEqual.bind(this)
			)
		);

		patchState({
			operationRecords: [
				..._.orderBy(
					records,
					[nameof<AccountingGridRecord>((r) => r.operationDate)],
					['asc']
				),
			],
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
				..._.orderBy(
					records,
					[nameof<AccountingGridRecord>((r) => r.operationDate)],
					['asc']
				),
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
			.sortBy(nameof<AccountingGridRecord>((r) => r.operationDate))
			.value();

		patchState({
			operationRecords: [...orderedRecords],
		});
	}
}
