import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import {
	AccountingRoutingModule,
	AccountingOperatiosGridComponent,
	AccountingOperationsCrudComponent,
} from '../accounting';
import { AccountingTableState } from '../../app/modules/shared/store/states/accounting/accounting-table.state';
import { CategoriesDialogService } from 'presentation/currency-rates/services/categories-dialog.service';
import { CounterpartiesState } from '../../app/modules/shared/store/states/handbooks/counterparties.state';
import { CategoriesState } from '../../app/modules/shared/store/states/handbooks/categories.state';
import { HandbbooksState } from '../../app/modules/shared/store/states/handbooks/handbooks.state';
import { AppSharedModule } from '../../app/modules/shared/shared.module';
import { AccountingState } from '../../app/modules/shared/store/states/accounting/accounting.state';
import { CounterpartiesDialogService } from '../currency-rates/services/counterparties-dialog.service';
import { AccountComponent } from './components/account/account.component';

@NgModule({
	declarations: [
		AccountingOperatiosGridComponent,
		AccountingOperationsCrudComponent,
		AccountComponent,
	],
	imports: [
		AppSharedModule,
		AccountingRoutingModule,
		NgxsModule.forFeature([
			AccountingState,
			AccountingTableState,
			HandbbooksState,
			CounterpartiesState,
			CategoriesState,
		]),
	],
	providers: [CategoriesDialogService, CounterpartiesDialogService],
	bootstrap: [],
})
export class AccountingModule {}
