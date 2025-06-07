import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-section-placeholder',
  template: `
    <div class="admin-section-placeholder">
      <h2>{{ title }}</h2>
      <p>La section <strong>{{ title }}</strong> est en construction.</p>
      <p>Vous pourrez bientôt gérer les {{ title.toLowerCase() }} ici.</p>
    </div>
  `,
  styles: [`
    .admin-section-placeholder {
      padding: 3rem 2rem;
      text-align: center;
      color: #b3005f;
      background: #f8f9fa;
      border-radius: 12px;
      margin: 2rem auto;
      max-width: 600px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
    .admin-section-placeholder h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
  `],
  standalone: true
})
export class AdminSectionPlaceholderComponent {
  @Input() title = 'Section';
}
