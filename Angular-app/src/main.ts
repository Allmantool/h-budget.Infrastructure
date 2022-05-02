import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { MainDashboardModule as MainDashboardModule } from './app/modules/main-dashboard/main-dashboard.module';
import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
}

platformBrowserDynamic()
	.bootstrapModule(MainDashboardModule)
	.catch((err) => console.error(err));
