import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPosWindowComponent } from './list-pos-window.component';

describe('ListPosWindowComponent', () => {
  let component: ListPosWindowComponent;
  let fixture: ComponentFixture<ListPosWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPosWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPosWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
