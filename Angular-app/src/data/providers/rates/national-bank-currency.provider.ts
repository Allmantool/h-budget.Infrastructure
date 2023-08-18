import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Mapper } from '@dynamic-mapper/angular';
import { Observable } from 'rxjs';
import { map, retry, take, tap } from 'rxjs/operators';
import { format } from 'date-fns';

import { BankCurrencyProvider } from '../../../domain/providers/rates/bank-currency.provider';
import { RoutesSegments } from '../../../app/modules/shared/constants/routes-segments';
import { Result } from '../../../core/result';
import { DaysRangePayload } from '../../../domain/models/dates-range-payload.model';
import { CurrencyRateGroupModel } from '../../../domain/models/rates/currency-rates-group.model';
import { RatesMappingProfile } from './mappers/rates-mapping.profiler';
import { RatesGroupEntity } from './entities/rates-group.entity';
import { UnifiedCurrencyRates } from 'presentation/currency-rates/models/unified-currency-rates';

@Injectable()
export class NationalBankCurrencyProvider implements BankCurrencyProvider {

	constructor(private readonly http: HttpClient, private readonly mapper: Mapper) { }

	public getCurrenciesForSpecifiedPeriod(
		payload: DaysRangePayload
	): Observable<CurrencyRateGroupModel[]> {

		return this.http
			.get<Result<RatesGroupEntity[]>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates/period/${format(payload.startDate, 'yyyy-MM-dd')}/${format(payload.endDate, 'yyyy-MM-dd')}`,
			)
			.pipe(
				map((responseResult) => this.mapper?.map(RatesMappingProfile.RatesGroupEntityToDomain, responseResult.payload)),
				retry(3),
				take(1)
			);
	}

	public saveCurrencies(
		rates: UnifiedCurrencyRates[]
	): Observable<Result<number>> {
		return this.http
			.post<Result<number>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates`,
				{
					currencyRates: rates,
				}
			)
			.pipe(
				tap((result: Result<number>) =>
					console.log(`Affected rows count: ${result.payload}`)
				),
				take(1)
			);
	}

	public getCurrencies(): Observable<CurrencyRateGroupModel[]> {
		return this.http
			.get<Result<RatesGroupEntity[]>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates`
			)
			.pipe(
				map((responseResult) => this.mapper?.map(RatesMappingProfile.RatesGroupEntityToDomain, responseResult.payload)),
				retry(3),
				take(1)
			);
	}

	public getTodayCurrencies(): Observable<CurrencyRateGroupModel[]> {
		return this.http
			.get<Result<RatesGroupEntity[]>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates/today`
			)
			.pipe(
				map((responseResult) => this.mapper?.map(RatesMappingProfile.RatesGroupEntityToDomain, responseResult.payload)),
				retry(3),
				take(1)
			);
	}
}
