import { TestBed } from '@angular/core/testing';

import { KeypressEventBroadcastService } from './keypress-event-broadcast.service';

describe('KeypressEventBroadcastService', () => {
  let service: KeypressEventBroadcastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeypressEventBroadcastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
