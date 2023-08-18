import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import {
	AccountingRoutingModule,
	AccountingGridComponent,
	AccountingCrudComponent,
} from '../accounting';
import { AppSharedModule } from 'app/modules/shared';
import { AccountingState } from 'app/modules/shared/store/states/accounting.state';

@NgModule({
	declarations: [AccountingGridComponent, AccountingCrudComponent],
	imports: [
		AppSharedModule,
		AccountingRoutingModule,
		NgxsModule.forFeature([AccountingState]),
	],
	providers: [],
	bootstrap: [],
})
export class AccountingModule {}
