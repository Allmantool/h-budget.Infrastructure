import { DialogDaysRangePayload } from 'app/modules/shared/models/dialog-dates-range-payload';
import { Observable } from 'rxjs';

import { Result } from '../../shared/models/result';
import { NationalBankCurrencyRateGroup } from '../models/currency-rates-group';
import { UnifiedCurrencyRates } from '../models/unified-currency-rates';

export interface BankCurrencyProvider {
	getCurrenciesForSpecifiedPeriod(
		payload: DialogDaysRangePayload
	): Observable<NationalBankCurrencyRateGroup[]>;
	getTodayCurrencies(): Observable<NationalBankCurrencyRateGroup[]>;
	getCurrencies(): Observable<NationalBankCurrencyRateGroup[]>;
	saveCurrencies(rates: UnifiedCurrencyRates[]): Observable<Result<number>>;
}
