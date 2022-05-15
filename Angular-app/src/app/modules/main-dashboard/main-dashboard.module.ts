import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';

import { AppSharedModule } from './../shared/shared.module';
import { environment } from '../../../environments/environment.prod';
import { CurrencyRatesState } from '../shared/store/states/currency-rates.state';
import { MainDashboardRoutingModule } from './main-dashboard-routing.module';
import { MainDashboardComponent } from './components/dashboard/main-dashboard.component';
import { MainDashboardCartComponent } from './components/dashboard-item/main-dashboard-cart.component';

@NgModule({
	declarations: [
		MainDashboardComponent,
		MainDashboardCartComponent
	],
	imports: [
		NgxsModule.forRoot([CurrencyRatesState], {
			developmentMode: !environment.production,
		}),
		NgxsLoggerPluginModule.forRoot(),
		NgxsReduxDevtoolsPluginModule.forRoot(),
		MainDashboardRoutingModule,
		AppSharedModule,
	],
	providers: [],
	bootstrap: [],
})
export class MainDashboardModule { }
