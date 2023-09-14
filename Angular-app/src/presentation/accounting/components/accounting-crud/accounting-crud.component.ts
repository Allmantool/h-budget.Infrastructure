import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import {
	UntypedFormBuilder,
	UntypedFormControl,
	UntypedFormGroup,
} from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, Subscription, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';

import { AccountingGridRecord } from '../../models/accounting-grid-record';
import { OperationCategory } from '../../../../domain/models/accounting/operation-category';
import { AccountingTableOptions } from 'app/modules/shared/store/models/accounting/accounting-table-options';
import { OperationType } from '../../../../domain/models/accounting/operation-type';
import { getAccountingTableOptions } from '../../../../app/modules/shared/store/states/accounting/selectors/table-options.selectors';
import { getAccountingRecords } from '../../../../app/modules/shared/store/states/accounting/selectors/accounting.selectors';
import { Edit } from '../../../../app/modules/shared/store/states/accounting/actions/accounting.actions';

@Component({
	selector: 'accounting-crud',
	templateUrl: './accounting-crud.component.html',
	styleUrls: ['./accounting-crud.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountingCrudComponent implements OnInit, OnDestroy {
	private subs: Subscription[] = [];

	public contractors: string[] = ['Перевозчик: Такси', 'Работа: GodelTech'];

	public categories: OperationCategory[] = [
		{
			type: OperationType.Expense,
			value: 'Транспорт: Общественный транспорт',
		},
		{
			type: OperationType.Expense,
			value: 'Транспорт: Такси',
		},
		{
			type: OperationType.Income,
			value: 'Доход: Аванс',
		},
	];

	public selectedRecord = new BehaviorSubject<
		AccountingGridRecord | undefined
	>(undefined);

	public crudRecordFg: UntypedFormGroup;

	@Select(getAccountingTableOptions)
	accountingTableOptions$!: Observable<AccountingTableOptions>;

	@Select(getAccountingRecords)
	accountingRecords$!: Observable<AccountingGridRecord[]>;

	constructor(
		fb: UntypedFormBuilder,
		private store: Store
	) {
		this.crudRecordFg = fb.group({
			id: new UntypedFormControl(),
			operationDate: new UntypedFormControl(),
			contractor: new UntypedFormControl(),
			category: new UntypedFormControl(),
			income: new UntypedFormControl(),
			expense: new UntypedFormControl(),
			comment: new UntypedFormControl(),
		});
	}

	ngOnDestroy(): void {
		this.subs.forEach((s) => s.unsubscribe());
	}

	ngOnInit(): void {
		const activeRecordSubscription$ = combineLatest([
			this.accountingTableOptions$,
			this.accountingRecords$,
		])
			.pipe(
				filter(
					([tableOptions, records]) =>
						!_.isNil(tableOptions?.selectedRecordGuid) &&
						!_.isNil(records)
				)
			)
			.subscribe(([tableOptions, records]) => {
				this.selectedRecord.next(
					records.find(
						(r) => tableOptions.selectedRecordGuid === r.id
					)
				);

				if (
					!_.isNil(this.crudRecordFg) &&
					!_.isNil(this.selectedRecord.value)
				) {
					const recordData = this.selectedRecord.value;

					this.crudRecordFg.patchValue({
						id: recordData.id,
						operationDate: recordData.operationDate,
						contractor: recordData.contractor,
						category: recordData.category,
						income: recordData.income,
						expense: recordData.expense,
						comment: recordData.comment,
					});
				}
			});

		const formChangeSubscription$ =
			this.crudRecordFg.valueChanges.subscribe((formData) => {
				this.selectedRecord.next(formData as AccountingGridRecord);
			});

		this.subs.push(activeRecordSubscription$, formChangeSubscription$);
	}

	public isExpenseOperation(): boolean {
		const selectedCategoryValue: string | undefined =
			this.crudRecordFg.controls['category']?.value ||
			this.selectedRecord?.value?.category;

		const selectedCategory = _.find(
			this.categories,
			(c) => c.value === selectedCategoryValue
		);

		return selectedCategory?.type === OperationType.Expense;
	}

	public getCategoryLabels(): string[] {
		return this.categories.map((c) => c.value);
	}

	public save(): void {
		if (!_.isNil(this.selectedRecord.value)) {
			this.store.dispatch(new Edit(this.selectedRecord.value));
		}
	}
}
