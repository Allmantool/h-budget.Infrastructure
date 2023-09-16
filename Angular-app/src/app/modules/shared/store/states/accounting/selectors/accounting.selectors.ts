import { createSelector } from '@ngxs/store';

import { AccountingState } from '../accounting.state';
import { IAccountingStateModel } from '../models/accounting-state.model';

export const getAccountingRecords = createSelector(
	[AccountingState],
	(state: IAccountingStateModel) => state?.operationRecords
);
