import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { Guid } from 'typescript-guid';

import { AccountingGridRecord } from '../../models/accounting-grid-record';
import {
	AddRange,
	SetActive,
} from './../../../shared/store/actions/accounting.actions';
import { AccountingState } from './../../../shared/store/states/accounting.state';

@Component({
	selector: 'accounting-grid',
	templateUrl: './accounting-grid.component.html',
	styleUrls: ['./accounting-grid.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountingGridComponent implements OnInit, OnDestroy {
	private subs: Subscription[] = [];

	@Select(AccountingState.getAccountingRecords)
	accountingRecords$!: Observable<AccountingGridRecord[]>;

	public ELEMENT_DATA: AccountingGridRecord[] = [
		{
			id: Guid.create(),
			operationDate: new Date(2022, 24, 4),
			contractor: 'Перевозчик: Такси',
			category: 'Транспорт: Такси',
			income: 0,
			expense: 0.35,
			balance: 0.35,
			comment: 'comment',
		},
		{
			id: Guid.create(),
			operationDate: new Date(2022, 28, 4),
			contractor: 'Перевозчик: Такси',
			category: 'Транспорт: Общественный транспорт',
			income: 0,
			expense: 0.35,
			balance: 0.35,
			comment: 'long long comment very long long long',
		},
		{
			id: Guid.create(),
			operationDate: new Date(2022, 29, 4),
			contractor: 'Перевозчик: Такси',
			category: 'Транспорт: Общественный транспорт',
			income: 0,
			expense: 11000.35,
			balance: 1201030.35,
			comment: 'long long comment very long long long',
		},
		{
			id: Guid.create(),
			operationDate: new Date(2022, 5, 5),
			contractor: 'Работа: GodelTech',
			category: 'Доход: Аванс',
			income: 15864,
			expense: 0,
			balance: 1201030.35,
			comment: 'long long comment very long long long',
		},
	];

	public displayedColumns: string[] = [
		'operationDate',
		'contractor',
		'category',
		'income',
		'expense',
		'balance',
		'comment',
	];

	public dataSource$: BehaviorSubject<AccountingGridRecord[]> =
		new BehaviorSubject<AccountingGridRecord[]>([]);
	public clickedRows = new Set<AccountingGridRecord>();

	constructor(private store: Store) {}
	ngOnInit(): void {
		const tableDataSource$ = this.accountingRecords$.subscribe((records) =>
			this.dataSource$.next(records)
		);

		this.subs.push(tableDataSource$);

		this.store.dispatch(new AddRange(this.ELEMENT_DATA));
	}

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	public selectRow(record: AccountingGridRecord): void {
		this.store.dispatch(new SetActive(record.id));
	}
}
