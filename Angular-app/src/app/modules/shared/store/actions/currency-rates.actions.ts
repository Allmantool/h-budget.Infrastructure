import { CurrencyRate } from '../models/currency-rates/currency-rate';

export class Add {
	static readonly type = '[CURR-RATES] Add';
	constructor(public rate: CurrencyRate) {}
}

export class AddRange {
	static readonly type = '[CURR-RATES] AddRange';
	constructor(public rates: CurrencyRate[]) {}
}

export class Edit {
	static readonly type = '[CURR-RATES] Edit';
	constructor(public rate: CurrencyRate) {}
}

export class FetchAllCurrencyRates {
	static readonly type = '[CURR-RATES] Fetch All';
}

export class Delete {
	static readonly type = '[CURR-RATES] Delete';
	constructor(public currencyId: number, public updateDate: Date) {}
}

export class SetActive {
	static readonly type = '[CURR-TABLE-OPTIONS] Set active';
	constructor(public id: number, public label: string) {}
}
