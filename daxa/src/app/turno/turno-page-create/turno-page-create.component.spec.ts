import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoPageCreateComponent } from './turno-page-create.component';

describe('TurnoPageCreateComponent', () => {
  let component: TurnoPageCreateComponent;
  let fixture: ComponentFixture<TurnoPageCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnoPageCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnoPageCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
