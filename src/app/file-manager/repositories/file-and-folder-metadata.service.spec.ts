import { TestBed } from '@angular/core/testing';

import { FileAndFolderMetadataService } from './file-and-folder-metadata.service';

describe('FileAndFolderMetadataService', () => {
  let service: FileAndFolderMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileAndFolderMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
