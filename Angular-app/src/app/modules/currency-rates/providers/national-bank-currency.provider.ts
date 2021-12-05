import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, retry, take, tap } from 'rxjs/operators';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { BankCurrencyProvider } from './bank-currency.provider';
import { NationalBankCurrencyRate } from '../models/national-bank-currency-rate';
import { RoutesSegments } from '../../shared/constants/routes-segments';

@Injectable({
	providedIn: 'root',
})
export class NationalBankCurrencyProvider implements BankCurrencyProvider {
	private acceptableCurrencies: Array<string> = ['USD', 'RUB', 'EUR'];

	constructor(private http: HttpClient) {}
	public saveCurrencies(rates: UnifiedCurrencyRates[]): Observable<number> {
		return this.http
			.post<number>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/CurrencyRates`,
				{
					CurrencyRates: rates,
				}
			)
			.pipe(
				tap((affectedRows: number) =>
					console.log(`Affected rows count: ${affectedRows}`)
				),
				take(1)
			);
	}

	public getCurrencies(): Observable<UnifiedCurrencyRates[]> {
		return this.http
			.get<UnifiedCurrencyRates[]>(
				`${RoutesSegments.HOME_BUDGET_APP_HOST}/CurrencyRates`
			)
			.pipe(retry(3), take(1));
	}

	public getTodayCurrencies(): Observable<UnifiedCurrencyRates[]> {
		return this.http
			.get<NationalBankCurrencyRate[]>(
				'https://www.nbrb.by/api/exrates/rates?periodicity=0'
			)
			.pipe(
				map((rates) =>
					rates
						.filter(
							(r) =>
								r.Cur_Abbreviation &&
								this.acceptableCurrencies.includes(
									r.Cur_Abbreviation
								)
						)
						.map((r) => new UnifiedCurrencyRates(r))
				),
				retry(3),
				take(1)
			);
	}
}
