import { createSelector } from '@ngxs/store';

import { AccountingState, IAccountingStateModel } from '../accounting.state';

export const getAccountingRecords = createSelector(
	[AccountingState],
	(state: IAccountingStateModel) => state?.operationRecords
);
