import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { AppSharedModule } from './../shared/shared.module';
import { AccountingRoutingModule, AccountingGridComponent, AccountingCrudComponent } from '../accounting';
import { AccountingState } from './../shared/store/states/accounting.state';

@NgModule({
    declarations: [
        AccountingGridComponent,
        AccountingCrudComponent,
    ],
    imports: [
        AppSharedModule,
        AccountingRoutingModule,
        NgxsModule.forFeature([AccountingState]),
    ],
    providers: [],
    bootstrap: [],
})
export class AccountingModule { }