import { TestBed } from '@angular/core/testing';

import { RoleBasedGuard } from './role-based.guard';

describe('RoleBasedGuard', () => {
  let guard: RoleBasedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RoleBasedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
