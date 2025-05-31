import { formationListComponent } from './components/formation-list/formation-list.component';
import { Formation } from './models/formation.model';

import { Routes } from '@angular/router';
import {  FormationFormComponent } from './components/formation-form/formation-form.component';
import { FormationDetailComponent } from './components/formation-detail/formation-detail.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CartComponent } from './components/cart/cart.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'formations', component: formationListComponent, canActivate: [AuthGuard] },
  { path: 'formation/new', component: FormationFormComponent, canActivate: [AuthGuard] },
  { path: 'formations/:id', component: FormationDetailComponent, canActivate: [AuthGuard] },
  { path: 'formations/:id/edit', component: FormationFormComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'formations', redirectTo: '/formations', pathMatch: 'full' },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];