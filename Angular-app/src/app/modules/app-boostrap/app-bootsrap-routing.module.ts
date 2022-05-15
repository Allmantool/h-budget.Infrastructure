import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";

import { PageNotFoundComponent } from './../shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import('../main-dashboard').then(m => m.MainDashboardModule)
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      preloadingStrategy: PreloadAllModules,
      enableTracing: true
    })],
  exports: [RouterModule],
})
export class AppBootsrapRoutingModule { }