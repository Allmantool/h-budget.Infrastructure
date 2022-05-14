import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainDashboardComponent } from './components/dashboard/main-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: MainDashboardComponent
  },
  {
    path: 'currency-rates',
    loadChildren: () => import('../currency-rates').then(m => m.CurrencyRatesModule)
  },
  {
    path: 'accounting',
    loadChildren: () => import('../accounting').then(m => m.AccountingModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainDashboardRoutingModule { }
