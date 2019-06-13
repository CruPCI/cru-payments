import * as bankAccount from './bank-account';
import * as ccp from '../payment-providers/ccp/ccp';

describe('bank account', () => {
  describe('init', () => {
    it('should export init', () => {
      expect(bankAccount.init).toEqual(expect.any(Function));
    });
  });

  describe('routingNumber', () => {
    it('should export all the published functions', () => {
      expect(bankAccount.routingNumber).toEqual({
        validate: {
          length: expect.any(Function),
          checksum: expect.any(Function),
          all: expect.any(Function),
        },
        errors: expect.any(Function),
      });
    });
  });

  describe('accountNumber', () => {
    it('should export all the published functions', () => {
      expect(bankAccount.accountNumber).toEqual({
        validate: {
          minLength: expect.any(Function),
          maxLength: expect.any(Function),
          all: expect.any(Function),
        },
        errors: expect.any(Function),
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
      jest
        .spyOn(ccp, 'encrypt')
        .mockReturnValue(Promise.resolve('<encrypted account number>'));
    });
    it('should return an error if something is invalid', done => {
      bankAccount.encrypt('1').then(
        () => {
          done.fail('Promise should have thrown an error');
        },
        error => {
          expect(error).toEqual('Bank account number invalid');
          done();
        },
      );
    });
    it('should return a token if encryption was successful', done => {
      bankAccount.encrypt('1234567890').then(
        response => {
          expect(response).toEqual('<encrypted account number>');
          done();
        },
        () => {
          done.fail('Promise should not have thrown an error');
        },
      );
    });
    it('should return an errored Promise if encryption was unsuccessful', done => {
      (ccp.encrypt as jest.Mock).mockReturnValue(Promise.reject('some error'));
      bankAccount.encrypt('123456').then(
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
