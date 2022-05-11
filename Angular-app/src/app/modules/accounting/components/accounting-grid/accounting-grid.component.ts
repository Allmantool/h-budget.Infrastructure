import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { AccountingGridRecord } from "../../models/accounting-grid-record";

@Component({
    selector: 'accounting-grid',
    templateUrl: './accounting-grid.component.html',
    styleUrls: ['./accounting-grid.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountingGridComponent {

    public ELEMENT_DATA: AccountingGridRecord[] = [
        {
            date: '24.04.2022',
            contractors: 'Перевозчик: Такси',
            category: 'Транспорт: Такси',
            Income: 0.1,
            expenditure: 0.35,
            balance: 0.35,
            comment: 'comment'
        },
        {
            date: '28.04.2022',
            contractors: 'Перевозчик: Такси',
            category: 'Транспорт: Общественный транспорт',
            Income: 0.156,
            expenditure: 0.35,
            balance: 0.35,
            comment: 'long long comment very long long long'
        },
        {
            date: '30.04.2022',
            contractors: 'Перевозчик: Такси',
            category: 'Транспорт: Общественный транспорт',
            Income: 216.156,
            expenditure: 11000.35,
            balance: 1201030.35,
            comment: 'long long comment very long long long'
        },
    ];

    displayedColumns: string[] = [
        'date',
        'contractors',
        'category',
        'Income',
        'expenditure',
        'balance',
        'comment'
    ];

    dataSource = this.ELEMENT_DATA;
    clickedRows = new Set<AccountingGridRecord>();
}