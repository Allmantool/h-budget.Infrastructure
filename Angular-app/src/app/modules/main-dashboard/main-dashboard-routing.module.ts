import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CurrencyRatesDashboardComponent } from '../currency-rates/components/currency-rates-dashboard/currency-rates-dashboard.component';
import { PageNotFoundComponent } from '../shared/components/pageNotFound/page-not-found.component';
import { MainDashboardComponent } from './components/dashboard/main-dashboard.component';
import { AccountingGridComponent } from './../accounting/components/accounting-grid/accounting-grid.component';

const routes: Routes = [
  {
    path: '', component: MainDashboardComponent
  },
  { path: 'currency-rates', component: CurrencyRatesDashboardComponent },
  { path: 'accounting', component: AccountingGridComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class MainDashboardRoutingModule { }
