import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertKeyValuePairComponent } from './upsert-key-value-pair.component';

describe('UpsertKeyValuePairComponent', () => {
  let component: UpsertKeyValuePairComponent;
  let fixture: ComponentFixture<UpsertKeyValuePairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpsertKeyValuePairComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpsertKeyValuePairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
