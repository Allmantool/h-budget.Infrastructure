import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ChangeDetectorRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Select } from '@ngxs/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';

import { AccountingGridRecord } from '../../models/accounting-grid-record';
import { AccountingState } from './../../../shared/store/states/accounting.state';
import { AccountingTableOptions } from './../../../shared/store/models/accounting/accounting-table-options';
import { OperationType } from '../../models/operation-type';
import { OperationCategory } from './../../models/operation-category';

@Component({
  selector: 'accounting-crud',
  templateUrl: './accounting-crud.component.html',
  styleUrls: ['./accounting-crud.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountingCrudComponent implements OnInit, OnDestroy {

  private subs: Subscription[] = [];

  public contractors: string[] = [
    'Перевозчик: Такси',
    'Работа: GodelTech'
  ];

  public categories: OperationCategory[] = [
    {
      type: OperationType.Expense,
      value: 'Транспорт: Общественный транспорт'
    },
    {
      type: OperationType.Expense,
      value: 'Транспорт: Такси'
    },
    {
      type: OperationType.Income,
      value: 'Доход: Аванс'
    },
  ];

  public selectedRecord: AccountingGridRecord | undefined = {} as AccountingGridRecord;

  public crudRecordFg: FormGroup;

  @Select(AccountingState.getAccountingTableOptions) accountingTableOptions$!: Observable<AccountingTableOptions>;
  @Select(AccountingState.getAccountingRecords) accountingRecords$!: Observable<AccountingGridRecord[]>;

  constructor(fb: FormBuilder, private ref: ChangeDetectorRef) {
    this.crudRecordFg = fb.group({
      "operationDate": new FormControl(),
      "contractor": new FormControl(),
      "category": new FormControl(),
      "income": new FormControl(),
      "expense": new FormControl(),
      "comment": new FormControl(),
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  ngOnInit(): void {

    const activeRecordSubscription$ = combineLatest([
      this.accountingTableOptions$,
      this.accountingRecords$
    ]).pipe(
      filter(([tableOptions, records]) => !_.isNil(tableOptions?.selectedRecordGuid) && !_.isNil(records))
    ).subscribe(([tableOptions, records]) => {
      this.selectedRecord = records.find(r => tableOptions.selectedRecordGuid === r.id);

      if (!_.isNil(this.crudRecordFg) && !_.isNil(this.selectedRecord)) {
        this.crudRecordFg.patchValue({
          "operationDate": this.selectedRecord.date,
          "contractor": this.selectedRecord.contractor,
          "category": this.selectedRecord.category,
          "income": this.selectedRecord.income,
          "expense": this.selectedRecord.expense,
          "comment": this.selectedRecord.comment,
        });
      }
    });

    const formChangeSubscription$ = this.crudRecordFg.valueChanges.subscribe(formData => {

    });

    this.subs.push(
      activeRecordSubscription$,
      formChangeSubscription$
    );
  }

  public isExpenseOperation(): boolean {
    const selectedCategoryValue = this.crudRecordFg.controls['category']?.value || this.selectedRecord?.category;
    const selectedCategory = _.find(this.categories, c => c.value === selectedCategoryValue);

    return selectedCategory?.type === OperationType.Expense;
  }

  public getCategoryLabels(): string[] {
    return this.categories.map(c => c.value);
  }

  public submit(): void { }
}