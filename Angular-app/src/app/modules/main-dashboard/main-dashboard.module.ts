import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { AppSharedModule } from './../shared/shared.module';
import { CurrencyRatesState } from '../shared/store/states/currency-rates.state';
import { MainDashboardRoutingModule } from './main-dashboard-routing.module';
import { MainDashboardComponent } from './components/dashboard/main-dashboard.component';
import { MainDashboardCartComponent } from './components/dashboard-item/main-dashboard-cart.component';

@NgModule({
	declarations: [MainDashboardComponent, MainDashboardCartComponent],
	imports: [
		NgxsModule.forFeature([CurrencyRatesState]),
		MainDashboardRoutingModule,
		AppSharedModule,
	],
	providers: [],
	bootstrap: [],
})
export class MainDashboardModule {}
