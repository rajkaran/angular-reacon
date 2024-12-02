import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectInactivityComponent } from './detect-inactivity.component';

describe('DetectInactivityComponent', () => {
  let component: DetectInactivityComponent;
  let fixture: ComponentFixture<DetectInactivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetectInactivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectInactivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
