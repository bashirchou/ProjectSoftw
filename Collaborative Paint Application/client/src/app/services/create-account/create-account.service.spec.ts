/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CreateAccountService } from './create-account.service';

describe('Service: CreateAccount', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateAccountService]
    });
  });

  it('should ...', inject([CreateAccountService], (service: CreateAccountService) => {
    expect(service).toBeTruthy();
  }));
});
