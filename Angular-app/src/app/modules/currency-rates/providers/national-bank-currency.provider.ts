import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, retry, take, tap } from 'rxjs/operators';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { BankCurrencyProvider } from './bank-currency.provider';
import { NationalBankCurrencyRate } from '../models/national-bank-currency-rate';
import { RoutesSegments } from '../../shared/constants/routes-segments';
import { Result } from '../../shared/models/result';

@Injectable({
	providedIn: 'root',
})
export class NationalBankCurrencyProvider implements BankCurrencyProvider {
	constructor(private http: HttpClient) { }
	public saveCurrencies(rates: UnifiedCurrencyRates[]): Observable<Result<number>> {
		return this.http
			.post<Result<number>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates`,
				{
					CurrencyRates: rates,
				}
			)
			.pipe(
				tap((result: Result<number>) =>
					console.log(`Affected rows count: ${result.payload}`)
				),
				take(1)
			);
	}

	public getCurrencies(): Observable<UnifiedCurrencyRates[]> {
		return this.http
			.get<Result<UnifiedCurrencyRates[]>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates`
			)
			.pipe(map(r => r.payload),retry(3), take(1));
	}

	public getTodayCurrencies(): Observable<UnifiedCurrencyRates[]> {
		return this.http
			.get<Result<NationalBankCurrencyRate[]>>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/currencyRates/today`
			)
			.pipe(
					map((result) => result.payload.map((r) => new UnifiedCurrencyRates(r))
				),
				retry(3),
				take(1)
			);
	}
}
