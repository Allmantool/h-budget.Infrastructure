import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AccountingRoutingModule {}
