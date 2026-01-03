import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoTurnoCreateDiologComponent } from './tipo-turno-create-dialog.component';

describe('TipoTurnoCreateDiologComponent', () => {
  let component: TipoTurnoCreateDiologComponent;
  let fixture: ComponentFixture<TipoTurnoCreateDiologComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoTurnoCreateDiologComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoTurnoCreateDiologComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
