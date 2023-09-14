import { createSelector } from '@ngxs/store';

import { AccountingState } from '../accounting.state';
import { IAccountingTableStateModel } from '../models/accounting-table-state.model';

export const getAccountingTableOptions = createSelector(
	[AccountingState],
	(state: IAccountingTableStateModel) => state?.tableOptions
);
