import * as bankAccount from './bank-account';
import * as ccp from '../payment-providers/ccp/ccp';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('bank account', () => {
  describe('init', () => {
    it('should export init', () => {
      expect(bankAccount.init).toEqual(jasmine.any(Function));
    });
  });

  describe('routingNumber', () => {
    it('should export all the published functions', () => {
      expect(bankAccount.routingNumber).toEqual({
        validate: {
          length: jasmine.any(Function),
          checksum: jasmine.any(Function),
          all: jasmine.any(Function),
        },
        errors: jasmine.any(Function),
      });
    });
  });

  describe('accountNumber', () => {
    it('should export all the published functions', () => {
      expect(bankAccount.accountNumber).toEqual({
        validate: {
          minLength: jasmine.any(Function),
          maxLength: jasmine.any(Function),
          all: jasmine.any(Function),
        },
        errors: jasmine.any(Function),
      });
    });
  });

  describe('validate', () => {
    it('should return true if routingNumber and accountNumber are valid', () => {
      expect(bankAccount.validate('267084131', '12')).toEqual(true);
      expect(bankAccount.validate('021300420', '12345678901234567')).toEqual(
        true,
      );
    });
    it('should return false if routingNumber is invalid', () => {
      expect(bankAccount.validate('267084132', '12')).toEqual(false);
    });
    it('should return false if accountNumber is invalid', () => {
      expect(bankAccount.validate('267084131', '1')).toEqual(false);
    });
  });

  describe('encrypt', () => {
    beforeEach(function() {
      spyOn(ccp, 'encrypt').and.returnValue(
        Observable.of('<encrypted account number>'),
      );
    });
    it('should return an error if something is invalid', done => {
      bankAccount.encrypt('1').subscribe(
        () => {
          done.fail('Observable should have thrown an error');
        },
        error => {
          expect(error).toEqual('Bank account number invalid');
          done();
        },
      );
    });
    it('should return a token if encryption was successful', done => {
      bankAccount.encrypt('1234567890').subscribe(
        response => {
          expect(response).toEqual('<encrypted account number>');
          done();
        },
        () => {
          done.fail('Observable should not have thrown an error');
        },
      );
    });
    it('should return an errored Observable if encryption was unsuccessful', done => {
      (<jasmine.Spy>ccp.encrypt).and.returnValue(
        Observable.throw('some error'),
      );
      bankAccount.encrypt('123456').subscribe(
        () => {
          done.fail('Observable should have thrown an error');
        },
        error => {
          expect(error).toEqual('some error');
          done();
        },
      );
    });
  });
});
