import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { CurrencyRatesDashboardComponent } from '../currency-rates';

const routes: Routes = [
	{ path: '', component: CurrencyRatesDashboardComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CurrencyRatesRoutingModule {}
