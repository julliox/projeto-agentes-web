import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPageAgentComponent } from './add-page-agent.component';

describe('AddPageAgentComponent', () => {
  let component: AddPageAgentComponent;
  let fixture: ComponentFixture<AddPageAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPageAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPageAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
