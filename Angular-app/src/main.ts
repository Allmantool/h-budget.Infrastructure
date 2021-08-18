import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { DashboardModule as DashboardModule } from './app/modules/dashboard/dashboard.module';
import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
}

platformBrowserDynamic()
	.bootstrapModule(DashboardModule)
	.catch((err) => console.error(err));
