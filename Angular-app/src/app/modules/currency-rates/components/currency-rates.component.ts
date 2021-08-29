import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { UnifiedCurrencyRates } from '../models/unified-currency-rates';
import { NationalBankCurrencyProvider } from '../providers/national-bank-currency.provider';

@Component({
	selector: 'app-currency-rates',
	templateUrl: './currency-rates.component.html',
	styleUrls: ['./currency-rates.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatesComponent implements OnInit, OnDestroy {
	public displayedColumns: string[] = [
		'id',
		'abbreviation',
		'scale',
		'name',
		'officialRate',
		'ratePerUnit',
		'updateDate',
	];

	private subs: Subscription[] = [];
	public todayCurrencyRates$: Subject<UnifiedCurrencyRates[]> = new Subject<
		UnifiedCurrencyRates[]
	>();

	constructor(public currencyRateProvider: NationalBankCurrencyProvider) {}
	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}
	ngOnInit(): void {
		const getRatesSub = this.todayCurrencyRates$
			.pipe(
				switchMap((rates) =>
					this.currencyRateProvider.saveCurrencies(rates)
				)
			)
			.subscribe((affectedRowCount) => console.log(affectedRowCount));

		if (getRatesSub) {
			this.subs.push(getRatesSub);
		}
	}

	public showUpTodayCurrencyRates(): void {
		this.currencyRateProvider
			.getCurrencies()
			.subscribe((r) => this.todayCurrencyRates$.next(r));

		return;
	}
}
