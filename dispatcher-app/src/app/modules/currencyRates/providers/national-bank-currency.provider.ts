import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, retry } from 'rxjs/operators';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { BankCurrencyProvider } from './bank-currency.provider';
import { NationalBankCurrencyRate } from '../models/national-bank-currency-rate';

@Injectable({
  providedIn: 'root',
})
export class NationalBankCurrencyProvider implements BankCurrencyProvider {
  private acceptableCurrencies: Array<string> = ['USD', 'RUB', 'EUR'];

  constructor(private http: HttpClient) {}

  public getCurrencies(): Observable<UnifiedCurrencyRates[]> {
    return this.http
      .get<NationalBankCurrencyRate[]>(
        'https://www.nbrb.by/api/exrates/rates?periodicity=0',
        { responseType: 'json' }
      )
      .pipe(
        map((rates) =>
          rates
            .filter(
              (r) =>
                r.Cur_Abbreviation &&
                this.acceptableCurrencies.includes(r.Cur_Abbreviation)
            )
            .map((r) => new UnifiedCurrencyRates(r))
        ),
        retry(3)
      );
  }
}
