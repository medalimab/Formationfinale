import { formationListComponent } from './components/formation-list/formation-list.component';
import { Formation } from './models/formation.model';
import { TemoignageComponent } from './components/temoignage/temoignage.component';
import { DevisListAdminComponent } from './components/devis/devis-list-admin.component';
import { DevisListClientComponent } from './components/devis/devis-list-client.component';
import { DevisFormComponent } from './components/devis/devis-form/devis-form.component';
import { AdminUserEditComponent } from './components/admin/admin-user-edit.component';

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
import { ServiceFormComponent } from './components/services/service-form/service-form.component';
// import { DevisFormComponent } from './components/devis/devis-form/devis-form.component'; // Commenté car problèmes de build
import { RendezVousFormComponent } from './components/rendez-vous/rendez-vous-form/rendez-vous-form.component';
import { RendezVousListComponent } from './components/rendez-vous/rendez-vous-list/rendez-vous-list.component';
import { BlogListComponent } from './components/blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './components/blog/blog-detail/blog-detail.component';
import { BlogFormComponent } from './components/blog/blog-form/blog-form.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { DebugComponent } from './components/debug/debug.component';
import { AuthCheckComponent } from './components/auth-check/auth-check.component';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminSectionPlaceholderComponent } from './components/admin/admin-section-placeholder.component';
import { AdminCartListComponent } from './components/admin/admin-cart-list.component';
import { AdminUsersComponent } from './components/admin/admin-users.component';

@Injectable({ providedIn: 'root' })
export class AdminRedirectGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(): boolean {
    // Toujours rediriger vers /admin
    console.log('AdminRedirectGuard: redirection vers /admin');
    this.router.navigate(['/admin']);
    return false;
  }
}

export const routes: Routes = [
  // Routes publiques
  { path: '', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/login-success', canActivate: [AdminRedirectGuard], component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'debug', component: DebugComponent },
  { path: 'auth-check', component: AuthCheckComponent },
  { path: 'temoignages', component: TemoignageComponent },
  
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
  { path: 'service/new', component: ServiceFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['formateur', 'admin'] } },
  { path: 'services/:id/edit', component: ServiceFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['formateur', 'admin'] } },
    // Routes pour les devis - désactivées pour le moment
  { path: 'devis/new', component: DevisFormComponent, canActivate: [AuthGuard] },
  { path: 'devis/mes-devis', component: DevisListClientComponent, canActivate: [AuthGuard] },
  /* 
  { path: 'devis/new', component: DevisFormComponent, canActivate: [AuthGuard] },
  { path: 'devis/mes-devis', component: DevisListComponent, canActivate: [AuthGuard] },
  */
  
  // Routes pour les rendez-vous
  { path: 'rendez-vous/new', component: RendezVousFormComponent, canActivate: [AuthGuard] },
  { path: 'rendez-vous/mes-rendez-vous', component: RendezVousListComponent, canActivate: [AuthGuard] },
  { path: 'rendez-vous/edit/:id', component: RendezVousFormComponent, canActivate: [AuthGuard] },
  // Routes pour le blog
  { path: 'blog', component: BlogListComponent },
  { path: 'blog/new', component: BlogFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['formateur', 'admin'] } },
  { path: 'blog/:id/edit', component: BlogFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['formateur', 'admin'] } },
  { path: 'blog/:id', component: BlogDetailComponent },
    // Routes admin
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  // Route admin pour la gestion des devis
  { path: 'admin/devis', component: DevisListAdminComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  // Routes admin modules - à implémenter plus tard
  { path: 'admin/services', component: ServiceListComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/blog', component: BlogListComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/blog/new', component: BlogFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/blog/:id/edit', component: BlogFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/blog/:id', component: BlogDetailComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/formations', component: formationListComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/formations/new', component: FormationFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/formations/:id', component: FormationDetailComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/formations/:id/edit', component: FormationFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/temoignages', component: TemoignageComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/contacts', component: ContactComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/rendez-vous', component: RendezVousListComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/rendez-vous/new', component: RendezVousFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/rendez-vous/edit/:id', component: RendezVousFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/services/new', component: ServiceFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/services/:id', component: ServiceDetailComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/services/:id/edit', component: ServiceFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  // Route pour la liste des paniers/commandes admin
  { path: 'admin/panier', component: AdminCartListComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  // Utilisation de l'import dynamique pour le composant standalone
  {
    path: 'admin/users/edit/:id',
    component: AdminUserEditComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  /* 
  { path: 'admin/services', loadChildren: () => import('./components/admin/service-management/service-management.module').then(m => m.ServiceManagementModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/blog', loadChildren: () => import('./components/admin/blog-management/blog-management.module').then(m => m.BlogManagementModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/formations', loadChildren: () => import('./components/admin/formation-management/formation-management.module').then(m => m.FormationManagementModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'admin/temoignages', loadChildren: () => import('./components/admin/temoignage-management/temoignage-management.module').then(m => m.TemoignageManagementModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  */
  
  // Redirection
  { path: '**', redirectTo: '/' },
];