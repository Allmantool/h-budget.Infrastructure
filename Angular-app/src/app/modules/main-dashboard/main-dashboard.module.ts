import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { NgApexchartsModule } from 'ng-apexcharts';

import { environment } from '../../../environments/environment.prod';
import { CurrencyRatesState } from '../shared/store/states/currency-rates.state';
import { MainDashboardRoutingModule } from './main-dashboard-routing.module';
import { AppBootsrapCompenent } from '../shared/components/appBoostrap/app-boostrap.component';
import { CurrencyRatesGridComponent } from '../currency-rates/components/currency-rates-grid/currency-rates-grid.component';
import { CurrencyRatesDashboardComponent } from '../currency-rates/components/currency-rates-dashboard/currency-rates-dashboard.component';
import { CurrencyRatesLineChartComponent } from '../currency-rates/components/currency-rates-line-chart/currency-rates-line-chart.component';
import { MainDashboardComponent } from './components/dashboard/main-dashboard.component';
import { MainDashboardCartComponent } from './components/dashboard-item/main-dashboard-cart.component';

@NgModule({
	declarations: [
		AppBootsrapCompenent,
		MainDashboardComponent,
		CurrencyRatesDashboardComponent,
		CurrencyRatesGridComponent,
		CurrencyRatesLineChartComponent,
		MainDashboardCartComponent,
	],
	imports: [
		BrowserModule,
		MainDashboardRoutingModule,
		RouterModule,
		HttpClientModule,
		BrowserAnimationsModule,
		MatTableModule,
		MatCheckboxModule,
		NgApexchartsModule,
		MatCardModule,
		MatButtonModule,
		NgxsModule.forRoot([CurrencyRatesState], {
			developmentMode: !environment.production,
		}),
		NgxsLoggerPluginModule.forRoot(),
		NgxsReduxDevtoolsPluginModule.forRoot(),
	],
	providers: [],
	bootstrap: [AppBootsrapCompenent],
})
export class MainDashboardModule { }
