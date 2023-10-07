import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

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
import { CategoriesDialogComponent } from './components/dialog/categories/categories-dialog.component';

@NgModule({
	declarations: [
		AppDividerComponent,
		ProgressSpinnerComponent,
		ProgressBarComponent,
		PageNotFoundComponent,
		DatepickerComponent,
		DateRangeDialogComponent,
		CategoriesDialogComponent,
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
		CategoriesDialogComponent,
		AppFormFieldComponent,
		AppButtonComponent,

		MatDividerModule,
		MatIconModule,
		MatSidenavModule,
		MatButtonToggleModule,
		MatProgressSpinnerModule,
		MatProgressBarModule,
		MatTableModule,
		MatCheckboxModule,
		MatCardModule,
		MatButtonModule,
		MatChipsModule,
		MatAutocompleteModule,
		NgApexchartsModule,

		FormsModule,
		ReactiveFormsModule,

		AccountingCurrencyFormatPipe,
	],
	imports: [
		CommonModule,
		MatDividerModule,
		MatIconModule,
		MatSidenavModule,
		MatButtonToggleModule,
		MatProgressSpinnerModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatDialogModule,
		MatNativeDateModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatChipsModule,
		MatAutocompleteModule,
		ReactiveFormsModule,
	],
	providers: [],
	bootstrap: [],
})
export class AppSharedModule {}
