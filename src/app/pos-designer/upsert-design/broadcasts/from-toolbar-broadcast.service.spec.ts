import { TestBed } from '@angular/core/testing';

import { FromToolbarBroadcastService } from './from-toolbar-broadcast.service';

describe('FromToolbarBroadcastService', () => {
  let service: FromToolbarBroadcastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FromToolbarBroadcastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
