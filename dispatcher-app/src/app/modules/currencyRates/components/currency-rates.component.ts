import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Observable } from 'rxjs';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { NationalBankCurrencyProvider } from '../providers/national-bank-currency.provider';

@Component({
  selector: 'app-currency-rates',
  templateUrl: './currency-rates.component.html',
  styleUrls: ['./currency-rates.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatesComponent {
  public todayCurrencyRates$: Observable<UnifiedCurrencyRates[]> | undefined;

  constructor(public currencyRateProvider: NationalBankCurrencyProvider) {}

  public showUpTodayCurrencyRates() {
    this.todayCurrencyRates$ = this.currencyRateProvider.getCurrencies();
  }
}
