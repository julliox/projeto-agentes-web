import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTurnosComponent } from './view-turnos.component';

describe('ViewTurnosComponent', () => {
  let component: ViewTurnosComponent;
  let fixture: ComponentFixture<ViewTurnosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTurnosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTurnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
