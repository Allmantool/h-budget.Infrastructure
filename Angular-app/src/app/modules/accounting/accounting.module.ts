import { MatTableModule } from '@angular/material/table';
import { NgModule } from '@angular/core';

import { AccountingRoutingModule, AccountingGridComponent, AccountingCrudComponent } from '../accounting';

@NgModule({
    declarations: [
        AccountingGridComponent,
        AccountingCrudComponent,
    ],
    imports: [
        MatTableModule,
        AccountingRoutingModule,
    ],
    providers: [],
    bootstrap: [],
})
export class AccountingModule { }