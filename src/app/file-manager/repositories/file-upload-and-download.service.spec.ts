import { TestBed } from '@angular/core/testing';

import { FileUploadAndDownloadService } from './file-upload-and-download.service';

describe('FileUploadAndDownloadService', () => {
  let service: FileUploadAndDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileUploadAndDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
