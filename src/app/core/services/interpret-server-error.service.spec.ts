import { TestBed } from '@angular/core/testing';

import { InterpretServerErrorService } from './interpret-server-error.service';

describe('InterpretServerErrorService', () => {
  let service: InterpretServerErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterpretServerErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
