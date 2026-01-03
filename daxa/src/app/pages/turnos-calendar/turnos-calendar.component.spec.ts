import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosCalendarComponent } from './turnos-calendar.component';

describe('TurnosCalendarComponent', () => {
  let component: TurnosCalendarComponent;
  let fixture: ComponentFixture<TurnosCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnosCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnosCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

