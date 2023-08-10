import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { AppBootsrapRoutingModule, AppRootComponent } from '../app-boostrap';
import { AppSharedModule } from './../shared/shared.module';
import { ngxsConfig } from './../shared/store/ngxs.config';

@NgModule({
	declarations: [AppRootComponent],
	imports: [
		NgxsModule.forRoot([], ngxsConfig),
		NgxsLoggerPluginModule.forRoot(),
		NgxsReduxDevtoolsPluginModule.forRoot(),
		AppSharedModule,
		CommonModule,
		HttpClientModule,
		BrowserModule,
		BrowserAnimationsModule,
		AppBootsrapRoutingModule,
		RouterOutlet
	],
	providers: [],
	bootstrap: [AppRootComponent],
})
export class AppBootsrapModule {}
