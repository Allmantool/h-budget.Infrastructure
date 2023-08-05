import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, retry, take, tap } from 'rxjs/operators';
import { format } from 'date-fns';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { BankCurrencyProvider } from './bank-currency.provider';
import { RoutesSegments } from '../../shared/constants/routes-segments';
import { Result } from '../../shared/models/result';
import { DialogDaysRangePayload } from '../../shared/models/dialog-dates-range-payload';
import { NationalBankCurrencyRateGroup } from '../models/currency-rates-group';

@Injectable({
	providedIn: 'root',
})
export class NationalBankCurrencyProvider implements BankCurrencyProvider {
	constructor(private http: HttpClient) {}
	public getCurrenciesForSpecifiedPeriod(
		payload: DialogDaysRangePayload
	): Observable<NationalBankCurrencyRateGroup[]> {
		return this.http
			.get<Result<NationalBankCurrencyRateGroup[]>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates/period/${format(payload.startDate, 'yyyy-MM-dd')}/${format(payload.endDate, 'yyyy-MM-dd')}`,
			)
			.pipe(
				map((r) => r.payload),
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

	public getCurrencies(): Observable<NationalBankCurrencyRateGroup[]> {
		return this.http
			.get<Result<NationalBankCurrencyRateGroup[]>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates`
			)
			.pipe(
				map((r) => r.payload),
				retry(3),
				take(1)
			);
	}

	public getTodayCurrencies(): Observable<NationalBankCurrencyRateGroup[]> {
		return this.http
			.get<Result<NationalBankCurrencyRateGroup[]>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates/today`
			)
			.pipe(
				map((response) => response.payload),
				retry(3),
				take(1)
			);
	}
}
