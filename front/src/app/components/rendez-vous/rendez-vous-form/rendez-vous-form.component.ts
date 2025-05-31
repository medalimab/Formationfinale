import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { ServiceApiService } from '../../../services/service-api.service';
import { Service } from '../../../models/service.model';

@Component({
  selector: 'app-rendez-vous-form',
  templateUrl: './rendez-vous-form.component.html',
  styleUrls: ['./rendez-vous-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe]
})
export class RendezVousFormComponent implements OnInit {
  rendezVousForm!: FormGroup;
  loading: boolean = false;
  submitting: boolean = false;
  error: string | null = null;
  success: boolean = false;
  serviceId?: string;
  service?: Service;
  loadingService: boolean = false;
  plageHoraires: string[] = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];
  
  minDate: string = '';

  constructor(
    private fb: FormBuilder,
    private rendezVousService: RendezVousService,
    private serviceApiService: ServiceApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Calculer la date minimum (aujourd'hui)
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    this.initForm();
    
    this.route.queryParamMap.subscribe(params => {
      this.serviceId = params.get('serviceId') || undefined;
      
      if (this.serviceId) {
        this.loadServiceDetails();
      }
    });
  }

  loadServiceDetails(): void {
    this.loadingService = true;
    
    this.serviceApiService.getService(this.serviceId!).subscribe({
      next: (response) => {
        this.service = response.data;
        this.rendezVousForm.patchValue({
          service: this.serviceId
        });
        this.loadingService = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du service', err);
        this.loadingService = false;
      }
    });
  }

  initForm(): void {
    this.rendezVousForm = this.fb.group({
      service: ['', Validators.required],
      date: ['', Validators.required],
      heure: ['', Validators.required],
      duree: [60, [Validators.required, Validators.min(30), Validators.max(240)]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.rendezVousForm.invalid || this.submitting) {
      return;
    }
    
    this.submitting = true;
    this.error = null;
    
    const formData = this.rendezVousForm.value;
    
    this.rendezVousService.createRendezVous({
      service: formData.service,
      date: formData.date,
      heure: formData.heure,
      duree: formData.duree,
      notes: formData.notes,
      statut: 'en_attente'
    }).subscribe({
      next: (response) => {
        this.submitting = false;
        this.success = true;
        
        setTimeout(() => {
          this.router.navigate(['/rendez-vous/mes-rendez-vous']);
        }, 2000);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error.message || "Une erreur s'est produite lors de la prise de rendez-vous";
        console.error('Erreur lors de la création du rendez-vous', err);
      }
    });
  }
}
