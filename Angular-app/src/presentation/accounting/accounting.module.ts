import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import {
	AccountingRoutingModule,
	AccountingGridComponent,
	AccountingCrudComponent,
} from '../accounting';
import { AppSharedModule } from 'app/modules/shared';
import { AccountingState } from 'app/modules/shared/store/states/accounting/accounting.state';
import { AccountingTableState } from '../../app/modules/shared/store/states/accounting/accounting-table.state';

@NgModule({
	declarations: [AccountingGridComponent, AccountingCrudComponent],
	imports: [
		AppSharedModule,
		AccountingRoutingModule,
		NgxsModule.forFeature([AccountingState, AccountingTableState]),
	],
	providers: [],
	bootstrap: [],
})
export class AccountingModule {}
