import { TestBed } from '@angular/core/testing';

import { KeyValuePairService } from './key-value-pair.service';

describe('KeyValuePairService', () => {
  let service: KeyValuePairService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyValuePairService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
