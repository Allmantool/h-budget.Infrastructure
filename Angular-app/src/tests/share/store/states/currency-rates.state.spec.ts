import { TestBed } from '@angular/core/testing';

import { NgxsModule, Store } from '@ngxs/store';
import * as _ from 'lodash';
import { of } from 'rxjs';

import {
	AddCurrencyGroups,
	FetchAllCurrencyRates,
} from './../../../../app/modules/shared/store/actions/currency-rates.actions';
import { CurrencyRate } from './../../../../app/modules/shared/store/models/currency-rates/currency-rate';
import { CurrencyRateGroup } from './../../../../app/modules/shared/store/models/currency-rates/currency-rates-group';
import { CurrencyTrend } from './../../../../app/modules/shared/store/models/currency-rates/currency-trend';
import { ngxsConfig } from './../../../../app/modules/shared/store/ngxs.config';
import { CurrencyRatesState } from './../../../../app/modules/shared/store/states/currency-rates.state';
import { NationalBankCurrencyProvider } from './../../../../app/modules/currency-rates/providers/national-bank-currency.provider';
import { NationalBankCurrencyRateGroup } from './../../../../app/modules/currency-rates/models/currency-rates-group';

describe('Currency rates store', () => {
	let store: Store;
	let currencyRateProviderSpy: any;

	const initialStoreRateGroups: CurrencyRateGroup[] =
		new Array<CurrencyRateGroup>(
			{
				currencyId: 1,
				currencyRates: [
					{
						ratePerUnit: 14,
						currencyTrend: CurrencyTrend.notChanged,
						updateDate: new Date(2022, 1, 3),
					} as CurrencyRate,
					{
						ratePerUnit: 16,
						currencyTrend: CurrencyTrend.notChanged,
						updateDate: new Date(2022, 1, 4),
					} as CurrencyRate,
				],
			} as CurrencyRateGroup,
			{
				currencyId: 2,
				currencyRates: [
					{
						ratePerUnit: 12,
						currencyTrend: CurrencyTrend.up,
						updateDate: new Date(2022, 4, 4),
					} as CurrencyRate,
				],
			} as CurrencyRateGroup
		);

	beforeEach(() => {
		currencyRateProviderSpy = jasmine.createSpyObj('currencyRateProvider', [
			'getCurrencies',
		]);

		TestBed.configureTestingModule({
			imports: [NgxsModule.forRoot([CurrencyRatesState], ngxsConfig)],
			providers: [
				{
					provide: NationalBankCurrencyProvider,
					useValue: currencyRateProviderSpy,
				},
			],
		}).compileComponents();

		store = TestBed.inject(Store);

		store.dispatch(new AddCurrencyGroups(initialStoreRateGroups));
	});

	it('it "AddCurrencyGroups": initial setup - expect 2 carrency groups', () => {
		store
			.selectOnce((state) => state.currencyRateState.rateGroups)
			.subscribe((groups) => {
				expect(groups.length).toBe(2);
			});
	});

	it('it "AddCurrencyGroups": update existed currency groups - expect still 2 carrency groups', () => {
		const updatedCurrencyRateGroups = new Array({
			currencyId: 1,
			currencyRates: [
				{
					ratePerUnit: 17,
					currencyTrend: CurrencyTrend.up,
					updateDate: new Date(2022, 1, 3),
				} as CurrencyRate,
				{
					ratePerUnit: 8,
					currencyTrend: CurrencyTrend.up,
					updateDate: new Date(2022, 2, 3),
				} as CurrencyRate,
			],
		} as CurrencyRateGroup);

		store.dispatch(new AddCurrencyGroups(updatedCurrencyRateGroups));

		store
			.selectOnce((state) => state.currencyRateState.rateGroups)
			.subscribe((groups) => {
				expect(groups.length).toBe(2);
			});
	});

	it('it "AddCurrencyGroups": update existed currency groups - expect update currency with same date', () => {
		const updatedCurrencyRateGroups = new Array({
			currencyId: 1,
			currencyRates: [
				{
					ratePerUnit: 17,
					currencyTrend: CurrencyTrend.up,
					updateDate: new Date(2022, 1, 3),
				} as CurrencyRate,
				{
					ratePerUnit: 8,
					currencyTrend: CurrencyTrend.up,
					updateDate: new Date(2022, 2, 3),
				} as CurrencyRate,
			],
		} as CurrencyRateGroup);

		store.dispatch(new AddCurrencyGroups(updatedCurrencyRateGroups));

		store
			.selectOnce((state) => state.currencyRateState.rateGroups)
			.subscribe((groups) => {
				const updatedRateGroup = _.find(
					groups,
					(g) => g.currencyId == 1
				);
				const updatedRate = _.find(
					updatedRateGroup.currencyRates,
					(r) =>
						r.updateDate.toDateString() ===
						new Date(2022, 1, 3).toDateString()
				);

				expect(updatedRate.ratePerUnit).toBe(14);
			});
	});

	it('it "AddRange": update existed currency groups - expect predicte amount of rates within groups', () => {
		const updatedCurrencyRateGroups = new Array({
			currencyId: 1,
			currencyRates: [
				{
					ratePerUnit: 17,
					currencyTrend: CurrencyTrend.up,
					updateDate: new Date(2022, 1, 3),
				} as CurrencyRate,
				{
					ratePerUnit: 8,
					currencyTrend: CurrencyTrend.up,
					updateDate: new Date(2022, 2, 3),
				} as CurrencyRate,
			],
		} as CurrencyRateGroup);

		store.dispatch(new AddCurrencyGroups(updatedCurrencyRateGroups));

		store
			.selectOnce((state) => state.currencyRateState.rateGroups)
			.subscribe((groups: CurrencyRateGroup[]) => {
				const items = _.flattenDeep(
					_.map(groups, (g) => g.currencyRates)
				);

				expect(items.length).toBe(5);
			});
	});

	it('it "FetchAllCurrencyRates": update existed currency groups - expect predicte amount of rates within groups', () => {
		const stubValue = new Array<NationalBankCurrencyRateGroup>({
			currencyId: 1,
			abbreviation: 'Val-A',
			name: 'test-name',
			scale: 2,
			rateValues: [
				{
					ratePerUnit: 14,
					currencyTrend: CurrencyTrend.notChanged,
					updateDate: new Date(2022, 1, 3),
				} as CurrencyRate,
				{
					ratePerUnit: 16,
					currencyTrend: CurrencyTrend.notChanged,
					updateDate: new Date(2022, 1, 4),
				} as CurrencyRate,
			],
		});

		currencyRateProviderSpy.getCurrencies.and.returnValue(of(stubValue));
		store.dispatch(new FetchAllCurrencyRates());

		const groups = store.selectSnapshot(
			(state) => state.currencyRateState.rateGroups
		);

		const items = _.flattenDeep(_.map(groups, (g) => g.currencyRates));

		expect(items.length).toBe(2);
	});

	it('it "GetCurrencyRatesFromPreviousDay": return expected previous date currency rates', () => {
		const stubValue: CurrencyRateGroup[] = [
			{
				currencyId: 1,
				abbreviation: 'abbreviaion-1',
				name: 'name-1',
				scale: 100,
				currencyRates: [
					{
						ratePerUnit: 14,
						currencyTrend: CurrencyTrend.notChanged,
						updateDate: new Date(2022, 1, 1),
					} as CurrencyRate,
					{
						ratePerUnit: 16,
						currencyTrend: CurrencyTrend.notChanged,
						updateDate: new Date(2022, 1, 2),
					} as CurrencyRate,
					{
						ratePerUnit: 16,
						currencyTrend: CurrencyTrend.notChanged,
						updateDate: new Date(2022, 1, 4),
					} as CurrencyRate
				]
			},
		];

		const previousDayRates =
			CurrencyRatesState.getCurrencyRatesFromPreviousDay(stubValue);

		const previousDate = _.first(previousDayRates)?.updateDate;

		expect(previousDate?.getDate()).toBe(2);
	});

	it('it "GetCurrencyRatesByCurrencyId": return a currency group by id', () => {
		const carrencyGroup =
			CurrencyRatesState.getCurrencyRatesGroupByCurrencyId(
				store.selectSnapshot((state) => state.currencyRateState)
			)(2);

		expect(carrencyGroup.currencyId).toBe(2);
	});
});
