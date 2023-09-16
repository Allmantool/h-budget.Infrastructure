import { createSelector } from '@ngxs/store';

import { IAccountingTableStateModel } from '../models/accounting-table-state.model';
import { AccountingTableState } from '../accounting-table.state';

export const getAccountingTableOptions = createSelector(
	[AccountingTableState],
	(state: IAccountingTableStateModel) => state?.tableOptions
);
