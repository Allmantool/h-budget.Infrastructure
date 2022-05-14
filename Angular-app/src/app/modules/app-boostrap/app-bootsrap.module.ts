import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from "@angular/core";

import { AppBootsrapRoutingModule, AppRootComponent } from '../app-boostrap';
import { AppSharedModule } from './../shared/shared.module';

@NgModule({
    declarations: [
        AppRootComponent
    ],
    imports: [
        AppSharedModule,
        CommonModule,
        HttpClientModule,
        BrowserModule,
		BrowserAnimationsModule,
        AppBootsrapRoutingModule,
    ],
    providers: [],
    bootstrap: [AppRootComponent],
})
export class AppBootsrapModule { }