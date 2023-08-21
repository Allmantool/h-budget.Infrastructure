import { NgModule } from '@angular/core';

import { MapperModule } from '@dynamic-mapper/angular';
import { NgxsModule } from '@ngxs/store';

import {
	CurrencyRatesRoutingModule,
	CurrencyRatesDashboardComponent,
	CurrencyRatesGridComponent,
	CurrencyRatesLineChartComponent,
} from '../currency-rates';
import { LineChartService } from './services/line-chart.service';
import { DataRatesMappingProfile } from 'data/providers/rates/mappers/data-rates-mapping.profiler';
import { NationalBankCurrencyProvider } from 'data/providers/rates/national-bank-currency.provider';
import { RatesDialogService } from './services/rates-dialog.service';
import { AppCoreModule } from 'app/modules/core';
import { AppSharedModule } from 'app/modules/shared/shared.module';
import { CurrencyRatesState } from 'app/modules/shared/store/states/currency-rates.state';
import { CurrencyRatesGridService } from './services/currency-rates-grid.service';
import { PresentationRatesMappingProfile } from './mappers/presentation-rates-mapping.profiler';

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
		MapperModule.withProfiles([DataRatesMappingProfile, PresentationRatesMappingProfile])
	],
	providers: [
		LineChartService,
		RatesDialogService,
		NationalBankCurrencyProvider,
		CurrencyRatesGridService
	],
	bootstrap: [],
})
export class CurrencyRatesModule { }
