import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertAuthorizationMatrixComponent } from './upsert-authorization-matrix.component';

describe('UpsertAuthorizationMatrixComponent', () => {
  let component: UpsertAuthorizationMatrixComponent;
  let fixture: ComponentFixture<UpsertAuthorizationMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpsertAuthorizationMatrixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpsertAuthorizationMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
