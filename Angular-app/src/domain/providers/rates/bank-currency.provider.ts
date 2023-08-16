
import { Observable } from 'rxjs';

import { Result } from '../../../core/result';
import { CurrencyRateGroupModel } from '../../models/rates/currency-rates-group.model';
import { UnifiedCurrencyRates } from '../../../app/modules/currency-rates/models/unified-currency-rates';
import { DaysRangePayload } from '../../models/dates-range-payload.model';

export interface BankCurrencyProvider {
	getCurrenciesForSpecifiedPeriod(
		payload: DaysRangePayload
	): Observable<CurrencyRateGroupModel[]>;
	getTodayCurrencies(): Observable<CurrencyRateGroupModel[]>;
	getCurrencies(): Observable<CurrencyRateGroupModel[]>;
	saveCurrencies(rates: UnifiedCurrencyRates[]): Observable<Result<number>>;
}
