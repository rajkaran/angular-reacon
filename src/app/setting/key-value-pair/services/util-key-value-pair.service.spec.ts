import { TestBed } from '@angular/core/testing';

import { UtilKeyValuePairService } from './util-key-value-pair.service';

describe('UtilKeyValuePairService', () => {
  let service: UtilKeyValuePairService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilKeyValuePairService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
