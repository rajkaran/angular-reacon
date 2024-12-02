import { TestBed } from '@angular/core/testing';

import { AuthenticationLogService } from './authentication-log.service';

describe('AuthenticationLogService', () => {
  let service: AuthenticationLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthenticationLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
