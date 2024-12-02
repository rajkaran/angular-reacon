import { TestBed } from '@angular/core/testing';

import { AuthorizationMatrixService } from './authorization-matrix.service';

describe('AuthorizationMatrixService', () => {
  let service: AuthorizationMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorizationMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
