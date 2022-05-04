import { MainDashboardModule } from './../main-dashboard/main-dashboard.module';
import { NgModule } from "@angular/core";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { MainDashboardRoutingModule } from 'app/modules/main-dashboard/main-dashboard-routing.module';
import { ProgressSpinner } from '../shared/components/progress-spinner/progress-spinner.component';
import { AppRootCompenent } from "./components/app-root/app-root.component";

@NgModule({
    declarations: [
        AppRootCompenent,
        ProgressSpinner,
    ],
    imports: [
        BrowserModule,
        MainDashboardRoutingModule,
        MainDashboardModule,
        RouterModule,
        MatProgressSpinnerModule,
    ],
    providers: [],
    bootstrap: [AppRootCompenent],
})
export class AppBootsrapModule { }