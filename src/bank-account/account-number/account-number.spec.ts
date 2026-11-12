import * as accountNumber from './account-number';

describe('account number', () => {
  describe('validateMinLength', () => {
    it('should return true for valid numbers', () => {
      expect(accountNumber.validateMinLength('12')).toEqual(true);
      expect(accountNumber.validateMinLength('123')).toEqual(true);
      expect(accountNumber.validateMinLength('12345678901234567')).toEqual(
        true,
      );
      expect(accountNumber.validateMinLength('12345678901234567890')).toEqual(
        true,
      );
    });
    it('should return false for invalid numbers', () => {
      expect(accountNumber.validateMinLength('1')).toEqual(false);
      expect(accountNumber.validateMinLength('')).toEqual(false);
      expect(accountNumber.validateMinLength(undefined)).toEqual(false);
      expect(accountNumber.validateMinLength(null)).toEqual(false);
    });
  });
  describe('validateMaxLength', () => {
    it('should return true for valid numbers', () => {
      expect(accountNumber.validateMaxLength('')).toEqual(true);
      expect(accountNumber.validateMaxLength('1')).toEqual(true);
      expect(accountNumber.validateMaxLength('12')).toEqual(true);
      expect(accountNumber.validateMaxLength('123')).toEqual(true);
      expect(accountNumber.validateMaxLength('12345678901234567')).toEqual(
        true,
      );
    });
    it('should return false for invalid numbers', () => {
      expect(accountNumber.validateMaxLength('123456789012345678')).toEqual(
        false,
      );
      expect(accountNumber.validateMaxLength('12345678901234567890')).toEqual(
        false,
      );
    });
  });
  describe('validateAll', () => {
    it('should return true for valid numbers', () => {
      expect(accountNumber.validateAll('12')).toEqual(true);
      expect(accountNumber.validateAll('123')).toEqual(true);
      expect(accountNumber.validateAll('12345678901234567')).toEqual(true);
    });
    it('should return false for invalid numbers', () => {
      expect(accountNumber.validateMinLength(undefined)).toEqual(false);
      expect(accountNumber.validateMinLength(null)).toEqual(false);
      expect(accountNumber.validateAll('')).toEqual(false);
      expect(accountNumber.validateAll('1')).toEqual(false);
      expect(accountNumber.validateMaxLength('123456789012345678')).toEqual(
        false,
      );
      expect(accountNumber.validateMaxLength('12345678901234567890')).toEqual(
        false,
      );
    });
  });
  describe('errors', () => {
    it('should return errors for an empty account number', () => {
      expect(accountNumber.errors('')).toEqual([
        'Account number cannot be blank',
        'Account number must contain at least 2 digits',
      ]);
    });
    it('should return errors for a account number without enough digits', () => {
      expect(accountNumber.errors('1')).toEqual([
        'Account number must contain at least 2 digits',
      ]);
    });
    it('should return errors for a account number with too many digits', () => {
      expect(accountNumber.errors('123456789012345678')).toEqual([
        'Account number cannot contain more than 17 digits',
      ]);
    });
    it('should return an empty array for a valid account number', () => {
      expect(accountNumber.errors('1234567890')).toEqual([]);
    });
  });
});
