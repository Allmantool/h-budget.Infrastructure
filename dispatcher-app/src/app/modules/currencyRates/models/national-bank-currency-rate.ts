export class NationalBankCurrencyRate {
	constructor(private currencyRates: Partial<NationalBankCurrencyRate>) {
		this.Date = currencyRates.Date;
		this.Cur_Abbreviation = currencyRates.Cur_Abbreviation;
		this.Cur_Scale = currencyRates.Cur_Scale;
		this.Cur_Name = currencyRates.Cur_Name;
		this.Cur_OfficialRate = currencyRates.Cur_OfficialRate;
	}

	Cur_ID?: number;
	Date?: Date;
	Cur_Abbreviation?: string;
	Cur_Scale?: number;
	Cur_Name?: string;
	Cur_OfficialRate?: number;
}
