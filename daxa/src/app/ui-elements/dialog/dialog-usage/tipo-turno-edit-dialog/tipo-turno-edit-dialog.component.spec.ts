import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoTurnoEditDialogComponent } from './tipo-turno-edit-dialog.component';

describe('TipoTurnoEditDialogComponent', () => {
  let component: TipoTurnoEditDialogComponent;
  let fixture: ComponentFixture<TipoTurnoEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoTurnoEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoTurnoEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
