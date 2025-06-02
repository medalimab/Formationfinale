// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DatePipe, CurrencyPipe, SlicePipe } from '@angular/common';
import { FixedAuthInterceptor } from './interceptors/fixed-auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {  providers: [
    provideRouter(routes),
    provideHttpClient(), // Suppression de withFetch()
    provideAnimations(),
    { provide: HTTP_INTERCEPTORS, useClass: FixedAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    DatePipe,
    CurrencyPipe,
    SlicePipe
  ]
};