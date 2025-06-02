import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { FormationService } from '../../services/formation.service';
import { ServiceApiService } from '../../services/service-api.service';
import { TemoignageService } from '../../services/temoignage.service';
import { BlogService } from '../../services/blog.service';
import { Formation } from '../../models/formation.model';
import { Service } from '../../models/service.model';
import { Temoignage } from '../../models/temoignage.model';
import { Blog } from '../../models/blog.model';
import { TemoignageComponent } from '../temoignage/temoignage.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe, SlicePipe, TemoignageComponent],
  standalone: true
})
export class HomeComponent implements OnInit {
  formations: Formation[] = [];
  services: Service[] = [];
  temoignages: Temoignage[] = [];
  articles: Blog[] = [];
  
  constructor(
    private formationService: FormationService,
    private serviceApi: ServiceApiService,
    private temoignageService: TemoignageService,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.loadFormations();
    this.loadServices();
    this.loadTemoignages();
    this.loadArticles();
  }

  loadFormations(): void {
    this.formationService.getFormations().subscribe(
      response => {
        this.formations = response.data || [];
      },
      error => {
        console.error('Erreur lors du chargement des formations', error);
      }
    );
  }

  loadServices(): void {
    this.serviceApi.getServices().subscribe(
      response => {
        this.services = response.data || [];
      },
      error => {
        console.error('Erreur lors du chargement des services', error);
      }
    );
  }

  loadTemoignages(): void {
    this.temoignageService.getTemoignagesApprouves().subscribe(
      response => {
        this.temoignages = response.data || [];
      },
      error => {
        console.error('Erreur lors du chargement des témoignages', error);
      }
    );
  }

  loadArticles(): void {
    this.blogService.getArticles().subscribe(
      response => {
        this.articles = response.data || [];
      },
      error => {
        console.error('Erreur lors du chargement des articles', error);
      }
    );
  }
}
