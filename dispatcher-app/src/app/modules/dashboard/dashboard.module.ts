import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { DashboardComponent } from './components/dashboard.component';
import { CurrencyRatesComponent } from '../currencyRates/components/currency-rates.component';

@NgModule({
  declarations: [DashboardComponent, CurrencyRatesComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [
  ],
  bootstrap: [DashboardComponent],
})
export class DashboardModule {}
