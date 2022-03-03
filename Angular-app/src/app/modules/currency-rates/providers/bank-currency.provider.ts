import { Observable } from 'rxjs';
import { Result } from '../../shared/models/result';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';

export interface BankCurrencyProvider {
	getTodayCurrencies(): Observable<UnifiedCurrencyRates[]>;
	getCurrencies(): Observable<UnifiedCurrencyRates[]>;
	saveCurrencies(rates: UnifiedCurrencyRates[]): Observable<Result<number>>;
}
