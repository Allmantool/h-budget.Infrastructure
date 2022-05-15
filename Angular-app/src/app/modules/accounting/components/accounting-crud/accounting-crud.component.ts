import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { Select } from '@ngxs/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';

import { AccountingGridRecord } from '../../models/accounting-grid-record';
import { AccountingState } from './../../../shared/store/states/accounting.state';
import { AccountingTableOptions } from './../../../shared/store/models/accounting/accounting-table-options';

@Component({
  selector: 'accounting-crud',
  templateUrl: './accounting-crud.component.html',
  styleUrls: ['./accounting-crud.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountingCrudComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];

  public activeAccountingRecord: AccountingGridRecord | undefined = {} as AccountingGridRecord;

  @Select(AccountingState.getAccountingTableOptions) accountingTableOptions$!: Observable<AccountingTableOptions>;
  @Select(AccountingState.getAccountingRecords) accountingRecords$!: Observable<AccountingGridRecord[]>;

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  ngOnInit(): void {
    combineLatest([
      this.accountingTableOptions$,
      this.accountingRecords$
    ]).pipe(
      filter(([tableOptions, records]) => !_.isNil(tableOptions?.selectedRecordGuid) && !_.isNil(records))
    )
      .subscribe(([tableOptions, records]) => {
        this.activeAccountingRecord = records.find(r => tableOptions.selectedRecordGuid === r.id)
      })
  }
}