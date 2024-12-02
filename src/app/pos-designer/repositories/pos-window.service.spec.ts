import { TestBed } from '@angular/core/testing';

import { PosWindowService } from './pos-window.service';

describe('PosWindowService', () => {
  let service: PosWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
