import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DashboardComponent } from './components/dashboard.component';
import { CurrencyRatesComponent } from '../currencyRates/components/currency-rates.component';

@NgModule({
	declarations: [DashboardComponent, CurrencyRatesComponent],
	imports: [
		BrowserModule,
		HttpClientModule,
		BrowserAnimationsModule,
		MatTableModule,
	],
	providers: [],
	bootstrap: [DashboardComponent],
})
export class DashboardModule {}
