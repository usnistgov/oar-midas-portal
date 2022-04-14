import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EdiListComponent } from './components/edi-list/edi-list.component';
import { LandingComponent } from './components/landing/landing.component';
import { LogInComponent } from './components/log-in/log-in.component';
const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LogInComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'edi-list', component: EdiListComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }