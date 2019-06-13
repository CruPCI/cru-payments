import * as MockDate from 'mockdate';

import * as creditCard from './credit-card';
import * as tsys from '../payment-providers/tsys/tsys';

describe('credit card', () => {
  describe('init', () => {
    it('should export init', () => {
      expect(creditCard.init).toEqual(expect.any(Function));
    });
  });

  describe('card', () => {
    it('should export all the published functions', () => {
      expect(creditCard.card).toEqual({
        validate: {
          minLength: expect.any(Function),
          maxLength: expect.any(Function),
          knownType: expect.any(Function),
          typeLength: expect.any(Function),
          checksum: expect.any(Function),
          all: expect.any(Function),
        },
        errors: expect.any(Function),
        info: {
          type: expect.any(Function),
          expectedLengthForType: expect.any(Function),
        },
      });
    });
  });

  describe('cvv', () => {
    it('should export all the published functions', () => {
      expect(creditCard.cvv).toEqual({
        validate: {
          minLength: expect.any(Function),
          maxLength: expect.any(Function),
          cardTypeLength: expect.any(Function),
          all: expect.any(Function),
        },
        errors: expect.any(Function),
      });
    });
  });

  describe('expiryDate', () => {
    it('should export all the published functions', () => {
      expect(creditCard.expiryDate).toEqual({
        validate: {
          month: expect.any(Function),
          year: expect.any(Function),
          all: expect.any(Function),
        },
        errors: expect.any(Function),
      });
    });
  });

  describe('validate', () => {
    beforeEach(function() {
      MockDate.set(new Date(2015, 3, 1)); // Apr 01 2015
    });
    afterEach(function() {
      MockDate.reset();
    });
    it('should return true if card, cvv, and expiryDate are valid', () => {
      expect(creditCard.validate('4111111111111111', '123', 4, 2015)).toEqual(
        true,
      );
    });
    it('should return false if card is invalid', () => {
      expect(creditCard.validate('41111111111111112', '123', 4, 2015)).toEqual(
        false,
      );
    });
    it('should return false if cvv is invalid', () => {
      expect(creditCard.validate('4111111111111111', '12345', 4, 2015)).toEqual(
        false,
      );
    });
    it('should return false if date is invalid', () => {
      expect(creditCard.validate('4111111111111111', '123', 3, 2015)).toEqual(
        false,
      );
    });
  });

  describe('encrypt', () => {
    beforeEach(function() {
      MockDate.set(new Date(2015, 3, 1)); // Apr 01 2015
      jest
        .spyOn(tsys, 'encrypt')
        .mockReturnValue(Promise.resolve('<tsys card token>'));
    });
    afterEach(function() {
      MockDate.reset();
    });
    it('should return an errored Promise if something is invalid', done => {
      creditCard.encrypt('4111111111111112', '123', 4, 2015).then(
        () => {
          done.fail('Promise should have thrown an error');
        },
        error => {
          expect(error).toEqual('Credit card details invalid');
          done();
        },
      );
    });
    it('should return a token if encryption was successful', done => {
      creditCard.encrypt('4111111111111111', '123', 4, 2015).then(
        response => {
          expect(response).toEqual('<tsys card token>');
          done();
        },
        () => {
          done.fail('Promise should not have thrown an error');
        },
      );
    });
    it('should allow a null cvv which indicates that the cvv is optional', done => {
      creditCard.encrypt('4111111111111111', null, 4, 2015).then(
        response => {
          expect(response).toEqual('<tsys card token>');
          done();
        },
        () => {
          done.fail('Promise should not have thrown an error');
        },
      );
    });
    it('should return an errored Promise if encryption was unsuccessful', done => {
      (tsys.encrypt as jest.Mock).mockReturnValue(Promise.reject('some error'));
      creditCard.encrypt('4111111111111111', '123', 4, 2015).then(
        () => {
          done.fail('Promise should have thrown an error');
        },
        error => {
          expect(error).toEqual('some error');
          done();
        },
      );
    });
  });
});
