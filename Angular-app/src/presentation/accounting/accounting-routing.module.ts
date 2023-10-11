import { NgModule } from '@angular/core';
import { Routes, provideRouter, withDebugTracing } from '@angular/router';

import { AccountingOperationsCrudComponent, AccountingOperatiosGridComponent } from '../accounting';
import { AccountComponent } from './components/account/account.component';

const routes: Routes = [
	{ path: '', component: AccountComponent },
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
