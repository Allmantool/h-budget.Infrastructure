import { Observable } from 'rxjs';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';

export interface BankCurrencyProvider {
	getCurrencies(): Observable<UnifiedCurrencyRates[]>;
	saveCurrencies(rates: UnifiedCurrencyRates[]): Observable<number>;
}
