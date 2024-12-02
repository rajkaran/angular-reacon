import { TestBed } from '@angular/core/testing';

import { UtilFileManagerService } from './util-file-manager.service';

describe('UtilFileManagerService', () => {
  let service: UtilFileManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilFileManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
