import { TestBed } from '@angular/core/testing';

import { FeatureMethodService } from './feature-method.service';

describe('FeatureMethodService', () => {
  let service: FeatureMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
