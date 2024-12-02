import { TestBed } from '@angular/core/testing';

import { FromMediaBroadcastService } from './from-media-broadcast.service';

describe('FromMediaBroadcastService', () => {
  let service: FromMediaBroadcastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FromMediaBroadcastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
