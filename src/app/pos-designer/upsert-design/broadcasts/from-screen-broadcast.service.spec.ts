import { TestBed } from '@angular/core/testing';

import { FromScreenBroadcastService } from './from-screen-broadcast.service';

describe('FromScreenBroadcastService', () => {
  let service: FromScreenBroadcastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FromScreenBroadcastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
