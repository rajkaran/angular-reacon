import { TestBed } from '@angular/core/testing';

import { UtilAuthenticationService } from './util-authentication.service';

describe('UtilAuthenticationService', () => {
  let service: UtilAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
