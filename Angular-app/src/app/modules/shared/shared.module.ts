import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav';

import { NgApexchartsModule } from 'ng-apexcharts';

import { AppDividerComponent, ProgressSpinnerComponent, PageNotFoundComponent } from '../shared';

@NgModule({
    declarations: [
        AppDividerComponent,
        ProgressSpinnerComponent,
        PageNotFoundComponent
    ],
    exports: [
        AppDividerComponent,
        PageNotFoundComponent,
        ProgressSpinnerComponent,
     
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
    ],
    providers: [],
    bootstrap: [],
})
export class AppSharedModule { }