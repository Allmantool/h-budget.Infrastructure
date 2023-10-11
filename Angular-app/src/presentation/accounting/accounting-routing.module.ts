import { NgModule } from '@angular/core';
import { Routes, provideRouter, withDebugTracing } from '@angular/router';

import { AccountingOperationsCrudComponent, AccountingOperatiosGridComponent } from '../accounting';
import { PaymentAccountComponent } from './components/payment-account/payment-account.component';

const routes: Routes = [
	{ path: '', component: PaymentAccountComponent },
	{ path: 'operations', component: AccountingOperatiosGridComponent },
	{
		path: 'operations',
		component: AccountingOperationsCrudComponent,
		outlet: 'rightSidebar',
	},
];

@NgModule({
	imports: [],
	exports: [],
	providers: [provideRouter(routes, withDebugTracing())],
})
export class AccountingRoutingModule {}
