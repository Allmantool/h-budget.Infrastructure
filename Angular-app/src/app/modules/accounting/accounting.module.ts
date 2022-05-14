import { NgModule } from '@angular/core';

import { AppSharedModule } from './../shared/shared.module';
import { AccountingRoutingModule, AccountingGridComponent, AccountingCrudComponent } from '../accounting';

@NgModule({
    declarations: [
        AccountingGridComponent,
        AccountingCrudComponent,
    ],
    imports: [
        AppSharedModule,
        AccountingRoutingModule,
    ],
    providers: [],
    bootstrap: [],
})
export class AccountingModule { }