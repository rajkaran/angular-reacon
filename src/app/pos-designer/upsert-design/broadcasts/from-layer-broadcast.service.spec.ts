import { TestBed } from '@angular/core/testing';

import { FromLayerBroadcastService } from './from-layer-broadcast.service';

describe('FromLayerBroadcastService', () => {
  let service: FromLayerBroadcastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FromLayerBroadcastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
