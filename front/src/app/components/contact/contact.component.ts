import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.formBuilder.group({
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      sujet: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
  }

  // Getter pour faciliter l'accès aux champs du formulaire
  get f() { return this.contactForm.controls; }
  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';
    
    // Si le formulaire est invalide, arrêtez-vous ici
    if (this.contactForm.invalid) {
      return;
    }

    this.loading = true;
    this.contactService.envoyerContact(this.contactForm.value)
      .subscribe({
        next: (data) => {
          this.success = 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.';
          // Notification simple sans snackbar
          console.log('Message envoyé avec succès!');
          this.contactForm.reset();
          this.submitted = false;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
          // Notification simple sans snackbar
          console.error(this.error);
          this.loading = false;
        }
      }
      );
  }
}
