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

import { NgApexchartsModule } from 'ng-apexcharts';

import { AppDividerComponent, ProgressSpinnerComponent, PageNotFoundComponent } from '../shared';
import { DatepickerComponent } from './components/datepicker/app-datepicker.component';
import { AppFormFieldComponent } from './components/form-field/app-form-field.component';

@NgModule({
    declarations: [
        AppDividerComponent,
        ProgressSpinnerComponent,
        PageNotFoundComponent,
        DatepickerComponent,
        AppFormFieldComponent,
    ],
    exports: [
        AppDividerComponent,
        ProgressSpinnerComponent,
        PageNotFoundComponent,
        DatepickerComponent,
        AppFormFieldComponent,

        MatDividerModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatCheckboxModule,
        MatCardModule,
        MatButtonModule,
        NgApexchartsModule,
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
        MatSelectModule
    ],
    providers: [],
    bootstrap: [],
})
export class AppSharedModule { }