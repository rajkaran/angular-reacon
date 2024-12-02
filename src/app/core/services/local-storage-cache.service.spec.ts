import { TestBed } from '@angular/core/testing';

import { LocalStorageCacheService } from './local-storage-cache.service';

describe('LocalStorageCacheService', () => {
  let service: LocalStorageCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
