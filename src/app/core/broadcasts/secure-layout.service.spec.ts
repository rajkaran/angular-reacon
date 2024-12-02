import { TestBed } from '@angular/core/testing';

import { SecureLayoutService } from './secure-layout.service';

describe('SecureLayoutService', () => {
  let service: SecureLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
