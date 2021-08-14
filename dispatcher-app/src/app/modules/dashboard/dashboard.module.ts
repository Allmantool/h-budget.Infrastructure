import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './components/dashboard.component';
import { MockBackendInterceptor } from '../core/interceptors/mock-backend-interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    DashboardRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockBackendInterceptor,
      multi: true
    }
  ],
  bootstrap: [DashboardComponent]
})
export class DashboardModule { }
