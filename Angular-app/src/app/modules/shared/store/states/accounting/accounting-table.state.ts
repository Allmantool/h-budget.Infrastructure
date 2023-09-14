import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';

import { IAccountingTableStateModel } from './models/accounting-table-state.model';
import { AccountingTableOptions } from '../../models/accounting/accounting-table-options';
import { SetActiveAccountingOperation } from './actions/accounting-table-options.actions';

@State<IAccountingTableStateModel>({
	name: 'accountingTableState',
	defaults: {
		tableOptions: {} as AccountingTableOptions,
	},
	children: [],
})
@Injectable()
export class AccountingTableState {
	@Action(SetActiveAccountingOperation)
	setActive(
		{ patchState }: StateContext<IAccountingTableStateModel>,
		{ id }: SetActiveAccountingOperation
	): void {
		patchState({
			tableOptions: { selectedRecordGuid: id } as AccountingTableOptions,
		});
	}
}
