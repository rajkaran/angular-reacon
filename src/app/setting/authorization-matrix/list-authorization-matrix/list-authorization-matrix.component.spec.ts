import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAuthorizationMatrixComponent } from './list-authorization-matrix.component';

describe('ListAuthorizationMatrixComponent', () => {
  let component: ListAuthorizationMatrixComponent;
  let fixture: ComponentFixture<ListAuthorizationMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListAuthorizationMatrixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAuthorizationMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
