import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
		MatCheckboxModule,
		NgApexchartsModule,
		NgxsModule.forRoot([CurrencyRatesState], {
			developmentMode: !environment.production,
		}),
		NgxsLoggerPluginModule.forRoot(),
		NgxsReduxDevtoolsPluginModule.forRoot(),
	],
	providers: [],
	bootstrap: [DashboardComponent],
})
export class DashboardModule {}
