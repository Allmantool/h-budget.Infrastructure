import { CurrencyRateGroup } from '../models/currency-rates/currency-rates-group';

export class Add {
	static readonly type = '[CURR-RATE-GROUP] Add';
	constructor(public rateGroup: CurrencyRateGroup) { }
}

export class AddRange {
	static readonly type = '[CURR-RATES-GROUP] AddRange';
	constructor(public addedRateGroups: CurrencyRateGroup[]) { }
}

export class Edit {
	static readonly type = '[CURR-RATES-GROUP] Edit';
	constructor(public rateGroup: CurrencyRateGroup) { }
}

export class FetchAllCurrencyRates {
	static readonly type = '[CURR-RATES-GROUP] Fetch All';
}

export class SetActive {
	static readonly type = '[CURR-TABLE-OPTIONS] Set active';
	constructor(public id: number, public label: string) { }
}
