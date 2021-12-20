import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgApexchartsModule } from 'ng-apexcharts';

import { DashboardComponent } from './components/dashboard.component';
import { CurrencyRatesComponent } from '../currency-rates/components/currency-rates.component';
import { CurrencyRatesLineChartComponent } from '../currency-rates-line-chart/components/currency-rates-line-chart.component';
import { environment } from '../../../environments/environment.prod';
import { CurrencyRatesState } from '../shared/store/states/currency-rates.state';

@NgModule({
	declarations: [
		DashboardComponent,
		CurrencyRatesComponent,
		CurrencyRatesLineChartComponent,
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		BrowserAnimationsModule,
		MatTableModule,
		NgApexchartsModule,
		NgxsModule.forRoot([CurrencyRatesState], {
			developmentMode: !environment.production,
		}),
	],
	providers: [],
	bootstrap: [DashboardComponent],
})
export class DashboardModule {}
