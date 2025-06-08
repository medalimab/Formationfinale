// src/app/app.component.ts
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/shared/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
    <app-footer *ngIf="showFooter"></app-footer>
  `,
  styles: []
})
export class AppComponent {
  showNavbar = true;
  showFooter = true;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe(() => {
        const path = this.router.url;
        this.showNavbar = path !== '/login' && path !== '/register';
        this.showFooter = !path.startsWith('/admin'); // Cacher le footer sur les pages admin
      });
      // Initial check
      const path = this.router.url;
      this.showNavbar = path !== '/login' && path !== '/register';
      this.showFooter = !path.startsWith('/admin'); // Cacher le footer sur les pages admin
    } else {
      this.showNavbar = false;
      this.showFooter = false;
    }
  }
}