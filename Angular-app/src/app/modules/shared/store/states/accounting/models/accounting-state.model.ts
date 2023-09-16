import { AccountingGridRecord } from '../../../../../../../presentation/accounting/models/accounting-grid-record';

export interface IAccountingStateModel {
	operationRecords: AccountingGridRecord[];
	activeCurrency: string;
}
