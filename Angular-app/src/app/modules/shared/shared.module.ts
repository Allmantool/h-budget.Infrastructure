import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgApexchartsModule } from 'ng-apexcharts';

import { AppDividerComponent, ProgressSpinnerComponent, PageNotFoundComponent } from '../shared';
import { DatepickerComponent } from './components/datepicker/app-datepicker.component';
import { AppFormFieldComponent } from './components/form-field/app-form-field.component';
import { AppButtonComponent } from './components/button/app-button.component';
import { AccountingCurrencyFormatPipe } from './pipes/accouting-currency-pipe';

@NgModule({
    declarations: [
        AppDividerComponent,
        ProgressSpinnerComponent,
        PageNotFoundComponent,
        DatepickerComponent,
        AppFormFieldComponent,
        AppButtonComponent,

        AccountingCurrencyFormatPipe
    ],
    exports: [
        CommonModule,

        AppDividerComponent,
        ProgressSpinnerComponent,
        PageNotFoundComponent,
        DatepickerComponent,
        AppFormFieldComponent,
        AppButtonComponent,

        MatDividerModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatCheckboxModule,
        MatCardModule,
        MatButtonModule,
        NgApexchartsModule,

        FormsModule,
        ReactiveFormsModule,

        AccountingCurrencyFormatPipe
    ],
    imports: [
        CommonModule,
        MatDividerModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule
    ],
    providers: [],
    bootstrap: [],
})
export class AppSharedModule { }