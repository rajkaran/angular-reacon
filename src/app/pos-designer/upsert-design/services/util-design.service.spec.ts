import { TestBed } from '@angular/core/testing';

import { UtilDesignService } from './util-design.service';

describe('UtilDesignService', () => {
  let service: UtilDesignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilDesignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
