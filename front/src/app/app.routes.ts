import { formationListComponent } from './components/formation-list/formation-list.component';
import { Formation } from './models/formation.model';

import { Routes } from '@angular/router';
import { FormationFormComponent } from './components/formation-form/formation-form.component';
import { FormationDetailComponent } from './components/formation-detail/formation-detail.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CartComponent } from './components/cart/cart.component';
import { HomeComponent } from './components/home/home.component';
import { ContactComponent } from './components/contact/contact.component';
import { ServiceListComponent } from './components/services/service-list/service-list.component';
import { ServiceDetailComponent } from './components/services/service-detail/service-detail.component';
// import { DevisFormComponent } from './components/devis/devis-form/devis-form.component'; // Commenté car problèmes de build
import { RendezVousFormComponent } from './components/rendez-vous/rendez-vous-form/rendez-vous-form.component';
import { RendezVousListComponent } from './components/rendez-vous/rendez-vous-list/rendez-vous-list.component';
import { BlogListComponent } from './components/blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './components/blog/blog-detail/blog-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Routes publiques
  { path: '', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  
  // Routes authentifiées
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'formations', component: formationListComponent },
  { path: 'formations/:id', component: FormationDetailComponent },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  
  // Routes pour les formateurs et admins
  { path: 'formation/new', component: FormationFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['formateur', 'admin'] } },
  { path: 'formations/:id/edit', component: FormationFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['formateur', 'admin'] } },
  
  // Nouvelles routes pour les services
  { path: 'services', component: ServiceListComponent },
  { path: 'services/:id', component: ServiceDetailComponent },
    // Routes pour les devis - désactivées pour le moment
  /* 
  { path: 'devis/new', component: DevisFormComponent, canActivate: [AuthGuard] },
  { path: 'devis/mes-devis', component: DevisListComponent, canActivate: [AuthGuard] },
  */
  
  // Routes pour les rendez-vous
  { path: 'rendez-vous/new', component: RendezVousFormComponent, canActivate: [AuthGuard] },
  { path: 'rendez-vous/mes-rendez-vous', component: RendezVousListComponent, canActivate: [AuthGuard] },
  
  // Routes pour le blog
  { path: 'blog', component: BlogListComponent },
  { path: 'blog/:id', component: BlogDetailComponent },
    // Routes admin
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  /* Routes admin modules - à implémenter plus tard
  { path: 'admin/users', loadChildren: () => import('./components/admin/user-management/user-management.module').then(m => m.UserManagementModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/services', loadChildren: () => import('./components/admin/service-management/service-management.module').then(m => m.ServiceManagementModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/blog', loadChildren: () => import('./components/admin/blog-management/blog-management.module').then(m => m.BlogManagementModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/formations', loadChildren: () => import('./components/admin/formation-management/formation-management.module').then(m => m.FormationManagementModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/temoignages', loadChildren: () => import('./components/admin/temoignage-management/temoignage-management.module').then(m => m.TemoignageManagementModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  */
  
  // Redirection
  { path: '**', redirectTo: '/' },
];