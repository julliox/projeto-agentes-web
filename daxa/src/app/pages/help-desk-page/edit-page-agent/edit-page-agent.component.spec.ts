import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPageAgentComponent } from './edit-page-agent.component';

describe('EditPageAgentComponent', () => {
  let component: EditPageAgentComponent;
  let fixture: ComponentFixture<EditPageAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPageAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPageAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
