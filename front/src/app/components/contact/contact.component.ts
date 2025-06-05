import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Contact } from '../../models/contact.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  userRole: string | null = null;
  contacts: Contact[] = [];
  contactsLoading = false;
  search = '';
  selectedContact: Contact | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactService,
    private authService: AuthService
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
    this.userRole = this.authService.getUserRole();
    if (this.userRole === 'admin' || this.userRole === 'formateur') {
      this.loadContacts();
    }
  }

  loadContacts(): void {
    this.contactsLoading = true;
    this.contactService.getContacts().subscribe({
      next: (res) => {
        this.contacts = res.data || [];
        this.contactsLoading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des messages de contact.";
        this.contactsLoading = false;
      }
    });
  }

  // Getter pour faciliter l'accès aux champs du formulaire
  get f() { return this.contactForm.controls; }
  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';
    if (!this.authService.isAuthenticated()) {
      this.error = 'Veuillez vous connecter pour envoyer un message.';
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1200);
      return;
    }
    if (this.contactForm.invalid) {
      return;
    }
    this.loading = true;
    this.contactService.envoyerContact(this.contactForm.value)
      .subscribe({
        next: (data) => {
          this.success = 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.';
          this.contactForm.reset();
          this.submitted = false;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
          this.loading = false;
        }
      });
  }

  get filteredContacts(): Contact[] {
    if (!this.search) return this.contacts;
    const s = this.search.toLowerCase();
    return this.contacts.filter(c =>
      (c.nom && c.nom.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      (c.sujet && c.sujet.toLowerCase().includes(s)) ||
      (c.message && c.message.toLowerCase().includes(s))
    );
  }

  openContactDetails(contact: Contact) {
    this.selectedContact = contact;
  }

  closeContactDetails() {
    this.selectedContact = null;
  }

  traiterContact(contact: Contact) {
    if (!contact._id) return;
    this.contactService.traiterContact(contact._id).subscribe({
      next: () => {
        contact.traite = true;
      }
    });
  }

  supprimerContact(contact: Contact) {
    if (!contact._id) return;
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    this.contactService.deleteContact(contact._id).subscribe({
      next: () => {
        this.contacts = this.contacts.filter(c => c._id !== contact._id);
        if (this.selectedContact && this.selectedContact._id === contact._id) {
          this.selectedContact = null;
        }
      }
    });
  }
}
