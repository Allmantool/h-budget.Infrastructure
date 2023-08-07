import { NgModule } from '@angular/core';

import {
	CurrencyRatesRoutingModule,
	CurrencyRatesDashboardComponent,
	CurrencyRatesGridComponent,
	CurrencyRatesLineChartComponent,
} from '../currency-rates';
import { AppSharedModule } from '../shared';
import { AppCoreModule } from './../core/core.module';
import { LineChartService } from './services/line-chart.service';

@NgModule({
	declarations: [
		CurrencyRatesDashboardComponent,
		CurrencyRatesGridComponent,
		CurrencyRatesLineChartComponent,
	],
	imports: [CurrencyRatesRoutingModule, AppSharedModule, AppCoreModule],
	providers: [LineChartService],
	bootstrap: [],
})
export class CurrencyRatesModule {}
