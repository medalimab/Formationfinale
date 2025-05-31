import { ComponentFixture, TestBed } from '@angular/core/testing';

import { formationListComponent } from './formation-list.component';

describe('formationListComponent', () => {
  let component: formationListComponent;
  let fixture: ComponentFixture<formationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [formationListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(formationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
