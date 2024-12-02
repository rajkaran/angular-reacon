import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertOrganizationComponent } from './upsert-organization.component';

describe('UpsertOrganizationComponent', () => {
  let component: UpsertOrganizationComponent;
  let fixture: ComponentFixture<UpsertOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpsertOrganizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpsertOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
