import * as creditCard from './credit-card';
import * as tsys from '../payment-providers/tsys/tsys';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('credit card', () => {

  describe('init', () => {
    it('should export init', () => {
      expect(creditCard.init).toEqual(jasmine.any(Function));
    });
  });

  describe('card', () => {
    it('should export all the published functions', () => {
      expect(creditCard.card).toEqual({
        validate: {
          minLength: jasmine.any(Function),
          maxLength: jasmine.any(Function),
          knownType: jasmine.any(Function),
          typeLength: jasmine.any(Function),
          checksum: jasmine.any(Function),
          all: jasmine.any(Function)
        },
        errors: jasmine.any(Function),
        info: {
          type: jasmine.any(Function),
          expectedLengthForType: jasmine.any(Function)
        }
      });
    });
  });

  describe('cvv', () => {
    it('should export all the published functions', () => {
      expect(creditCard.cvv).toEqual({
        validate: {
          minLength: jasmine.any(Function),
          maxLength: jasmine.any(Function),
          cardTypeLength: jasmine.any(Function),
          all: jasmine.any(Function)
        },
        errors: jasmine.any(Function)
      });
    });
  });

  describe('expiryDate', () => {
    it('should export all the published functions', () => {
      expect(creditCard.expiryDate).toEqual({
        validate: {
          month: jasmine.any(Function),
          year: jasmine.any(Function),
          all: jasmine.any(Function)
        },
        errors: jasmine.any(Function)
      });
    });
  });

  describe('validate', () => {
    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2015, 3, 1)); // Apr 01 2015
    });
    afterEach(function() {
      jasmine.clock().uninstall();
    });
    it('should return true if card, cvv, and expiryDate are valid', () => {
      expect(creditCard.validate('4111111111111111', '123', 4, 2015)).toEqual(true);
    });
    it('should return false if card is invalid', () => {
      expect(creditCard.validate('41111111111111112', '123', 4, 2015)).toEqual(false);
    });
    it('should return false if cvv is invalid', () => {
      expect(creditCard.validate('4111111111111111', '12345', 4, 2015)).toEqual(false);
    });
    it('should return false if date is invalid', () => {
      expect(creditCard.validate('4111111111111111', '123', 3, 2015)).toEqual(false);
    });
  });

  describe('encrypt', () => {
    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2015, 3, 1)); // Apr 01 2015
      spyOn(tsys, 'encrypt').and.returnValue(Observable.of('<tsys card token>'));
    });
    afterEach(function() {
      jasmine.clock().uninstall();
    });
    it('should return an errored Observable if something is invalid', (done) => {
      creditCard.encrypt('4111111111111112', '123', 4, 2015)
        .subscribe(() => {
          done.fail('Observable should have thrown an error');
        }, error => {
          expect(error).toEqual('Credit card details invalid');
          done();
        });
    });
    it('should return a token if encryption was successful', (done) => {
      creditCard.encrypt('4111111111111111', '123', 4, 2015)
        .subscribe(response => {
          expect(response).toEqual('<tsys card token>');
          done();
        }, () => {
          done.fail('Observable should not have thrown an error');
        });
    });
    it('should allow a null cvv which indicates that the cvv is optional', (done) => {
      creditCard.encrypt('4111111111111111', null, 4, 2015)
        .subscribe(response => {
          expect(response).toEqual('<tsys card token>');
          done();
        }, () => {
          done.fail('Observable should not have thrown an error');
        });
    });
    it('should return an errored Observable if encryption was unsuccessful', (done) => {
      (<jasmine.Spy> tsys.encrypt).and.returnValue(Observable.throw('some error'));
      creditCard.encrypt('4111111111111111', '123', 4, 2015)
        .subscribe(() => {
          done.fail('Observable should have thrown an error');
        }, error => {
          expect(error).toEqual('some error');
          done();
        });
    });
  });
});
