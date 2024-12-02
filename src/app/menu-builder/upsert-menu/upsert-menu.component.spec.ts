import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertMenuComponent } from './upsert-menu.component';

describe('UpsertMenuComponent', () => {
  let component: UpsertMenuComponent;
  let fixture: ComponentFixture<UpsertMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpsertMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpsertMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
