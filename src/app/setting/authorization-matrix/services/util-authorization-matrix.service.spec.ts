import { TestBed } from '@angular/core/testing';

import { UtilAuthorizationMatrixService } from './util-authorization-matrix.service';

describe('UtilAuthorizationMatrixService', () => {
  let service: UtilAuthorizationMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilAuthorizationMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
