import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { FixedAuthInterceptor } from './interceptors/fixed-auth.interceptor';
// Import facultatif de l'intercepteur d'erreur dans app.module
// import { ErrorInterceptor } from './interceptors/error.interceptor';
import { CommonModule, DatePipe, CurrencyPipe, SlicePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Import seulement les composants non-standalone
import { formationListComponent } from './components/formation-list/formation-list.component';
import { FormationDetailComponent } from './components/formation-detail/formation-detail.component';
import { FormationFormComponent } from './components/formation-form/formation-form.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CartComponent } from './components/cart/cart.component';

@NgModule({  declarations: [
    // Laisser vide car tous les composants sont standalone
  ],imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FixedAuthInterceptor,
      multi: true
    },
    DatePipe,
    CurrencyPipe,
    SlicePipe
  ]
  // Pas besoin de bootstrap car AppComponent est standalone
})
export class AppModule { }