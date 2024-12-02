import { TestBed } from '@angular/core/testing';

import { UtilOrganizationService } from './util-organization.service';

describe('UtilOrganizationService', () => {
  let service: UtilOrganizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilOrganizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
