import { TestBed } from '@angular/core/testing';

import { CommunicateServerService } from './communicate-server.service';

describe('CommunicateServerService', () => {
  let service: CommunicateServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunicateServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
