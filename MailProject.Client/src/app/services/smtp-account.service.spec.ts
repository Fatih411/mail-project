import { TestBed } from '@angular/core/testing';

import { SmtpAccountService } from './smtp-account.service';

describe('SmtpAccountService', () => {
  let service: SmtpAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmtpAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
