import { CurrencyRateGroup } from '../models/currency-rates/currency-rates-group';

export class Add {
	static readonly type = '[CURR-RATE-GROUP] Add currency group';
	constructor(public rateGroup: CurrencyRateGroup) {}
}

export class AddCurrencyGroups {
	static readonly type = '[CURR-RATES-GROUP] Add currency groups';
	constructor(public addedRateGroups: CurrencyRateGroup[]) {}
}

export class Edit {
	static readonly type = '[CURR-RATES-GROUP] Edit currency group';
	constructor(public rateGroup: CurrencyRateGroup) {}
}

export class FetchAllCurrencyRates {
	static readonly type = '[CURR-RATES-GROUP] Fetch All currency groups';
}

export class SetActiveCurrency {
	static readonly type = '[CURR-TABLE-OPTIONS] Set active currency';
	constructor(public id: number, public label: string) {}
}

export class SetCurrencyDateRange {
	static readonly type = '[CURR-TABLE-OPTIONS] Set currency date range';
	constructor(public amountOfMonths: number) {}
}
