import { TestBed } from '@angular/core/testing';

import { UtilAutocompleteService } from './util-autocomplete.service';

describe('UtilAutocompleteService', () => {
  let service: UtilAutocompleteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilAutocompleteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
