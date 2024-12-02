import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractMessageComponent } from './interact-message.component';

describe('InteractMessageComponent', () => {
  let component: InteractMessageComponent;
  let fixture: ComponentFixture<InteractMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
