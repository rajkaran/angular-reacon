import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertFeatureMethodComponent } from './upsert-feature-method.component';

describe('UpsertFeatureMethodComponent', () => {
  let component: UpsertFeatureMethodComponent;
  let fixture: ComponentFixture<UpsertFeatureMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpsertFeatureMethodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpsertFeatureMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
