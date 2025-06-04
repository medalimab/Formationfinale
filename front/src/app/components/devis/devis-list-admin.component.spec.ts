import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DevisListAdminComponent } from './devis-list-admin.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DevisService } from '../../services/devis.service';
import { of } from 'rxjs';

describe('DevisListAdminComponent', () => {
  let component: DevisListAdminComponent;
  let fixture: ComponentFixture<DevisListAdminComponent>;
  let devisServiceSpy: jasmine.SpyObj<DevisService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DevisListAdminComponent],
      providers: [
        { provide: DevisService, useValue: jasmine.createSpyObj('DevisService', ['getDevis']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DevisListAdminComponent);
    component = fixture.componentInstance;
    devisServiceSpy = TestBed.inject(DevisService) as jasmine.SpyObj<DevisService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch devis on init', () => {
    const mockDevis = { data: [{ _id: '1', client: { nom: 'Test' }, service: 'Service', description: 'desc', statut: 'en_attente', dateDemande: new Date() }] };
    devisServiceSpy.getDevis.and.returnValue(of(mockDevis));
    component.ngOnInit();
    expect(component.devisList.length).toBe(1);
  });
});
