import * as cvv from './cvv';
import * as parsing from '../../utils/parsing';

describe('cvv', () => {
  describe('validateMinLength', () => {
    it('should clean input', () => {
      jest.spyOn(parsing, 'cleanInput');
      cvv.validateMinLength(123);
      expect(parsing.cleanInput).toHaveBeenCalledWith(123);
    });
    it('should return false if length is less than 3', () => {
      expect(cvv.validateMinLength(undefined)).toEqual(false);
      expect(cvv.validateMinLength(null)).toEqual(false);
      expect(cvv.validateMinLength('')).toEqual(false);
      expect(cvv.validateMinLength(1)).toEqual(false);
      expect(cvv.validateMinLength(12)).toEqual(false);
      expect(cvv.validateMinLength('12')).toEqual(false);
    });
    it('should return true if length is at least 3', () => {
      expect(cvv.validateMinLength(123)).toEqual(true);
      expect(cvv.validateMinLength('1234')).toEqual(true);
      expect(cvv.validateMinLength('12345')).toEqual(true);
    });
  });
  describe('validateMaxLength', () => {
    it('should clean input', () => {
      jest.spyOn(parsing, 'cleanInput');
      cvv.validateMaxLength(123);
      expect(parsing.cleanInput).toHaveBeenCalledWith(123);
    });
    it('should return true if length is at most 4', () => {
      expect(cvv.validateMaxLength(undefined)).toEqual(true);
      expect(cvv.validateMaxLength(null)).toEqual(true);
      expect(cvv.validateMaxLength('')).toEqual(true);
      expect(cvv.validateMaxLength(1)).toEqual(true);
      expect(cvv.validateMaxLength(12)).toEqual(true);
      expect(cvv.validateMaxLength('123')).toEqual(true);
      expect(cvv.validateMaxLength('1234')).toEqual(true);
      expect(cvv.validateMaxLength(1234)).toEqual(true);
    });
    it('should return false if length greater than 4', () => {
      expect(cvv.validateMaxLength(12345)).toEqual(false);
      expect(cvv.validateMaxLength('12345')).toEqual(false);
      expect(cvv.validateMaxLength('123456')).toEqual(false);
      expect(cvv.validateMaxLength(1234567)).toEqual(false);
    });
  });
  describe('validateCardTypeLength', () => {
    it('should clean input', () => {
      jest.spyOn(parsing, 'cleanInput');
      cvv.validateCardTypeLength(123, 'Visa');
      expect(parsing.cleanInput).toHaveBeenCalledWith(123);
    });
    it('should return true if cardType is not set', () => {
      expect(cvv.validateCardTypeLength(123)).toEqual(true);
      expect(cvv.validateCardTypeLength(1234)).toEqual(true);
    });
    it('should return true if cvv length is correct for the given card type', () => {
      expect(cvv.validateCardTypeLength(123, 'Visa')).toEqual(true);
      expect(cvv.validateCardTypeLength(123, 'MasterCard')).toEqual(true);
      expect(cvv.validateCardTypeLength(1234, 'American Express')).toEqual(
        true,
      );
      expect(cvv.validateCardTypeLength(123, 'Discover')).toEqual(true);
      expect(cvv.validateCardTypeLength(123, 'Diners Club')).toEqual(true);
    });
    it('should return false if cvv length is incorrect for the given card type', () => {
      expect(cvv.validateCardTypeLength(12, 'Visa')).toEqual(false);
      expect(cvv.validateCardTypeLength(1234, 'Visa')).toEqual(false);
      expect(cvv.validateCardTypeLength(12345, 'Visa')).toEqual(false);
      expect(cvv.validateCardTypeLength(12, 'MasterCard')).toEqual(false);
      expect(cvv.validateCardTypeLength(1234, 'MasterCard')).toEqual(false);
      expect(cvv.validateCardTypeLength(12345, 'MasterCard')).toEqual(false);
      expect(cvv.validateCardTypeLength(123, 'American Express')).toEqual(
        false,
      );
      expect(cvv.validateCardTypeLength(12345, 'American Express')).toEqual(
        false,
      );
      expect(cvv.validateCardTypeLength(12, 'Discover')).toEqual(false);
      expect(cvv.validateCardTypeLength(1234, 'Discover')).toEqual(false);
      expect(cvv.validateCardTypeLength(12345, 'Discover')).toEqual(false);
      expect(cvv.validateCardTypeLength(12, 'Diners Club')).toEqual(false);
      expect(cvv.validateCardTypeLength(1234, 'Diners Club')).toEqual(false);
      expect(cvv.validateCardTypeLength(12345, 'Diners Club')).toEqual(false);
    });
  });
  describe('validateAll', () => {
    it('should return true if cvv is valid', () => {
      expect(cvv.validateAll(123)).toEqual(true);
      expect(cvv.validateAll(1234)).toEqual(true);
      expect(cvv.validateAll('123')).toEqual(true);
      expect(cvv.validateAll('1234')).toEqual(true);
      expect(cvv.validateAll(9876)).toEqual(true);
      expect(cvv.validateAll('987')).toEqual(true);
      expect(cvv.validateCardTypeLength(1234, 'American Express')).toEqual(
        true,
      );
      expect(cvv.validateCardTypeLength(123, 'Visa')).toEqual(true);
    });
    it('should return false if cvv is invalid', () => {
      expect(cvv.validateAll(undefined)).toEqual(false);
      expect(cvv.validateAll('')).toEqual(false);
      expect(cvv.validateAll(1)).toEqual(false);
      expect(cvv.validateAll(12)).toEqual(false);
      expect(cvv.validateAll('12')).toEqual(false);
      expect(cvv.validateAll(12345)).toEqual(false);
      expect(cvv.validateAll('12345')).toEqual(false);
      expect(cvv.validateAll('123456')).toEqual(false);
      expect(cvv.validateAll(1234567)).toEqual(false);
      expect(cvv.validateCardTypeLength(123, 'American Express')).toEqual(
        false,
      );
      expect(cvv.validateCardTypeLength(1234, 'Visa')).toEqual(false);
    });
  });
  describe('errors', () => {
    it('should return errors for an empty cvv', () => {
      expect(cvv.errors('')).toEqual([
        'CVV cannot be blank',
        'CVV must contain at least 3 digits',
      ]);
    });
    it('should return errors for a cvv without enough digits', () => {
      expect(cvv.errors('12')).toEqual(['CVV must contain at least 3 digits']);
    });
    it('should return errors for a cvv with too many digits', () => {
      expect(cvv.errors('12345')).toEqual([
        'CVV cannot contain more than 4 digits',
      ]);
    });
    it('should return errors for a cvv that is invalid for a card type', () => {
      expect(cvv.errors('123', 'American Express')).toEqual([
        'CVV is not valid for this card type',
      ]);
    });
    it('should return an empty array for a valid cvv', () => {
      expect(cvv.errors('123', 'MasterCard')).toEqual([]);
    });
    it('should return true if cvv is null which indicates that the cvv is optional', () => {
      expect(cvv.validateAll(null)).toEqual(true);
    });
  });
});
