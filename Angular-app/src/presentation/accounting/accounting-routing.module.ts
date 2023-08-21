import { NgModule } from '@angular/core';
import { Routes, provideRouter, withDebugTracing } from '@angular/router';

import {
	AccountingCrudComponent,
	AccountingGridComponent,
} from '../accounting';

const routes: Routes = [
	{ path: '', component: AccountingGridComponent },
	{
		path: '',
		component: AccountingCrudComponent,
		outlet: 'right-sidebar',
	},
];

@NgModule({
	imports: [],
	exports: [],
	providers: [provideRouter(routes, withDebugTracing())],
})
export class AccountingRoutingModule {}
