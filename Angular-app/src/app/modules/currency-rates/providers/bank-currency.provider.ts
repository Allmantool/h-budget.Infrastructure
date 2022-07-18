import { DialogDaysRangePayload } from 'app/modules/shared/models/dialog-dates-range-payload';
import { Observable } from 'rxjs';

import { Result } from '../../shared/models/result';
import { UnifiedCurrencyRates } from '../models/unified-currency-rates';

export interface BankCurrencyProvider {
	getCurrenciesForSpecifiedPeriod(payload: DialogDaysRangePayload): Observable<UnifiedCurrencyRates[]>;
	getTodayCurrencies(): Observable<UnifiedCurrencyRates[]>;
	getCurrencies(): Observable<UnifiedCurrencyRates[]>;
	saveCurrencies(rates: UnifiedCurrencyRates[]): Observable<Result<number>>;
}
