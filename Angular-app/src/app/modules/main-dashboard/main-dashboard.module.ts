import { NgModule } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppSharedModule } from './../shared/shared.module';
import { MainDashboardRoutingModule } from './main-dashboard-routing.module';
import { MainDashboardComponent } from './components/dashboard/main-dashboard.component';
import { MainDashboardCartComponent } from './components/dashboard-item/main-dashboard-cart.component';

@NgModule({
	declarations: [MainDashboardComponent, MainDashboardCartComponent],
	imports: [
		MainDashboardRoutingModule,
		AppSharedModule,
		RouterLink
	],
	providers: [],
	bootstrap: [],
})
export class MainDashboardModule {}
