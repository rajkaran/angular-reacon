import { TestBed } from '@angular/core/testing';

import { JwtBasedGuard } from './jwt-based.guard';

describe('JwtBasedGuard', () => {
  let guard: JwtBasedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(JwtBasedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
