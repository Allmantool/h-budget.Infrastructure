import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  /*{ path: '**', component: PageNotFoundComponent },
  {
    path: '',
    component: AboutMainComponent,
    children: [
      { path: '', component: BioComponent },
      { path: 'team', component: TeamComponent },
      { path: 'clients', component: ClientsComponent },
    ]
  } */
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
