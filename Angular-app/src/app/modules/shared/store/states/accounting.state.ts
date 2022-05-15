import { Guid } from 'typescript-guid';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import * as _ from 'lodash';

import { AccountingTableOptions } from './../models/accounting/accounting-table-options';
import { AccountingGridRecord } from './../../../accounting/models/accounting-grid-record';
import { Add, AddRange, SetActive } from '../actions/accounting.actions';

export interface IAccountingStateModel {
	operationRecords: AccountingGridRecord[];
	tableOptions: AccountingTableOptions;
	activeCurrency: string;
}

@State<IAccountingStateModel>({
	name: 'accounting',
	defaults: {
		activeCurrency: 'BYN',
		operationRecords: [],
		tableOptions: {
			selectedRecordGuid: {},
		} as AccountingTableOptions
	},
})
@Injectable()
export class AccountingState {

	@Selector([AccountingState])
	static getAccountingRecords(state: IAccountingStateModel): AccountingGridRecord[] {
		return state.operationRecords;
	}

	@Selector([AccountingState])
	static getAccountingTableOptions(state: IAccountingStateModel) {
		return state.tableOptions;
	}

	@Action(Add)
	add(
		{ getState, patchState }: StateContext<IAccountingStateModel>,
		{ rate }: Add
	): void {
		const state = getState();
		patchState({
			operationRecords: [...state.operationRecords, rate],
		});
	}

	@Action(AddRange)
	addRange(
		{ getState, patchState }: StateContext<IAccountingStateModel>,
		{ rates }: AddRange
	): void {
		const state = getState();
		patchState({
			operationRecords: _.concat(
				state.operationRecords,
				_.differenceWith(rates, state.operationRecords, _.isEqual)
			),
		});
	}

	@Action(SetActive)
	setActive(
		{ patchState }: StateContext<IAccountingStateModel>,
		{ id }: SetActive
	): void {
		patchState({
			tableOptions: { selectedRecordGuid: id } as AccountingTableOptions
		});
	}
}