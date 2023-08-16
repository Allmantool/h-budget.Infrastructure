import { NgModule } from '@angular/core';

import { MapperModule } from '@dynamic-mapper/angular';
import { NgxsModule } from '@ngxs/store';

import {
	CurrencyRatesRoutingModule,
	CurrencyRatesDashboardComponent,
	CurrencyRatesGridComponent,
	CurrencyRatesLineChartComponent,
} from '../currency-rates';
import { AppSharedModule } from '../shared';
import { AppCoreModule } from './../core/core.module';
import { LineChartService } from './services/line-chart.service';
import { RatesMappingProfile } from 'data/providers/rates/mappers/rates-mapping.profiler';
import { NationalBankCurrencyProvider } from 'data/providers/rates/national-bank-currency.provider';
import { CurrencyRatesState } from '../shared/store/states/currency-rates.state';
import { RatesDialogService } from './services/rates-dialog.service';

@NgModule({
	declarations: [
		CurrencyRatesDashboardComponent,
		CurrencyRatesGridComponent,
		CurrencyRatesLineChartComponent,
	],
	imports: [
		CurrencyRatesRoutingModule,
		AppSharedModule,
		AppCoreModule,
		NgxsModule.forFeature([CurrencyRatesState]),
		MapperModule.withProfiles([RatesMappingProfile])
	],
	providers: [
		LineChartService,
		RatesDialogService,
		NationalBankCurrencyProvider
	],
	bootstrap: [],
})
export class CurrencyRatesModule { }
