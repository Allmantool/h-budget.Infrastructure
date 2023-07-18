import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgApexchartsModule } from 'ng-apexcharts';

import {
	AppDividerComponent,
	ProgressSpinnerComponent,
	PageNotFoundComponent,
} from '../shared';
import { DatepickerComponent } from './components/datepicker/app-datepicker.component';
import { AppFormFieldComponent } from './components/form-field/app-form-field.component';
import { AppButtonComponent } from './components/button/app-button.component';
import { AccountingCurrencyFormatPipe } from './pipes/accouting-currency-pipe';
import { DateRangeDialogComponent } from './components/dialog/dates-rage/dates-range-dialog.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';

@NgModule({
	declarations: [
		AppDividerComponent,
		ProgressSpinnerComponent,
		ProgressBarComponent,
		PageNotFoundComponent,
		DatepickerComponent,
		DateRangeDialogComponent,
		AppFormFieldComponent,
		AppButtonComponent,

		AccountingCurrencyFormatPipe,
	],
	exports: [
		CommonModule,

		AppDividerComponent,
		ProgressSpinnerComponent,
		ProgressBarComponent,
		PageNotFoundComponent,
		DatepickerComponent,
		DateRangeDialogComponent,
		AppFormFieldComponent,
		AppButtonComponent,

		MatDividerModule,
		MatSidenavModule,
		MatProgressSpinnerModule,
		MatProgressBarModule,
		MatTableModule,
		MatCheckboxModule,
		MatCardModule,
		MatButtonModule,
		NgApexchartsModule,

		FormsModule,
		ReactiveFormsModule,

		AccountingCurrencyFormatPipe,
	],
	imports: [
		CommonModule,
		MatDividerModule,
		MatSidenavModule,
		MatProgressSpinnerModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatDialogModule,
		MatNativeDateModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		ReactiveFormsModule,
	],
	providers: [],
	bootstrap: [],
	entryComponents: [DateRangeDialogComponent],
})
export class AppSharedModule {}
