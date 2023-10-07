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
import { Guid } from 'typescript-guid';

import { AccountingGridRecord } from '../../models/accounting-grid-record';
import { OperationCategory } from '../../../../domain/models/accounting/operation-category';
import { AccountingTableOptions } from 'app/modules/shared/store/models/accounting/accounting-table-options';
import { OperationType } from '../../../../domain/models/accounting/operation-type';
import { getAccountingTableOptions } from '../../../../app/modules/shared/store/states/accounting/selectors/table-options.selectors';
import { getAccountingRecords } from '../../../../app/modules/shared/store/states/accounting/selectors/accounting.selectors';
import { SetActiveAccountingOperation } from '../../../../app/modules/shared/store/states/accounting/actions/accounting-table-options.actions';
import { CategoriesDialogService } from '../../../currency-rates/services/categories-dialog.service';
import {
	Edit,
	Add,
	Delete,
} from '../../../../app/modules/shared/store/states/accounting/actions/accounting.actions';

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

	public selectedRecord$ = new BehaviorSubject<
		AccountingGridRecord | undefined
	>(undefined);

	public crudRecordFg: UntypedFormGroup;

	@Select(getAccountingTableOptions)
	accountingTableOptions$!: Observable<AccountingTableOptions>;

	@Select(getAccountingRecords)
	accountingRecords$!: Observable<AccountingGridRecord[]>;

	constructor(
		private readonly fb: UntypedFormBuilder,
		private readonly categoriesDialogService: CategoriesDialogService,
		private readonly store: Store
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
						!_.isNil(tableOptions) && !_.isNil(records)
				)
			)
			.subscribe(([tableOptions, records]) => {
				this.selectedRecord$.next(
					records.find(
						(r) => tableOptions.selectedRecordGuid === r.id
					)
				);

				if (
					!_.isNil(this.crudRecordFg) &&
					!_.isNil(this.selectedRecord$.value)
				) {
					const recordData = this.selectedRecord$.value;

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
				this.selectedRecord$.next(formData as AccountingGridRecord);
			});

		this.subs.push(activeRecordSubscription$, formChangeSubscription$);
	}

	public isExpenseOperation(): boolean {
		const selectedCategoryValue: string =
			this.crudRecordFg.controls['category']?.value ||
			this.selectedRecord$?.value?.category;

		const selectedCategory = _.find(
			this.categories,
			(c) => c.value === selectedCategoryValue
		);

		return selectedCategory?.type === OperationType.Expense;
	}

	public getCategoryLabels(): string[] {
		return this.categories.map((c) => c.value);
	}

	public saveRecord(): void {
		if (!_.isNil(this.selectedRecord$.value)) {
			this.store.dispatch(new Edit(this.selectedRecord$.value));
		}
	}

	public addRecord(): void {
		const newRecord = {
			id: Guid.create(),
			operationDate: new Date(),
			contractor: '',
			category: '',
			income: 0,
			expense: 0,
			balance: 0,
			comment: '',
		} as AccountingGridRecord;

		this.store.dispatch(new Add(newRecord));

		this.selectedRecord$.next(newRecord);

		this.store.dispatch(new SetActiveAccountingOperation(newRecord.id));
	}

	public deleteRecord(): void {
		console.log(this.selectedRecord$.value);

		const recordGuid = this.selectedRecord$.value?.id;

		if (_.isNil(recordGuid)) {
			return;
		}

		this.store.dispatch(new Delete(recordGuid));
	}

	public addCategory(): void {
		this.categoriesDialogService.openCategories();
	}
}
