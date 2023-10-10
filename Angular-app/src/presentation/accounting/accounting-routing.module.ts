import { NgModule } from '@angular/core';
import { Routes, provideRouter, withDebugTracing } from '@angular/router';

import { AccountingOperationsCrudComponent, AccountingOperatiosGridComponent } from '../accounting';

const routes: Routes = [
	{ path: '', component: AccountingOperatiosGridComponent },
	{
		path: '',
		component: AccountingOperationsCrudComponent,
		outlet: 'right-sidebar',
	},
];

@NgModule({
	imports: [],
	exports: [],
	providers: [provideRouter(routes, withDebugTracing())],
})
export class AccountingRoutingModule {}
