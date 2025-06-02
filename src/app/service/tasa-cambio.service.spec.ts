import { TestBed } from '@angular/core/testing';

import { TasaCambioService } from './tasa-cambio.service';

describe('TasaCambioService', () => {
  let service: TasaCambioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasaCambioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
