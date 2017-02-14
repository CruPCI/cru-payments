import * as cardNumber from './card-number';
import * as parsing from '../../utils/parsing';
import * as cardTypes from './utils/card-types';
import * as luhn from './utils/luhn-check';

describe('card number', () => {
  describe('validateMinLength', () => {
    it('should clean input', () => {
      spyOn(parsing, 'cleanInput').and.callThrough();
      cardNumber.validateMinLength(null);
      expect(parsing.cleanInput).toHaveBeenCalled();
    });
    it('should validate the minimum length', () => {
      expect(cardNumber.validateMinLength('123')).toEqual(false);
      expect(cardNumber.validateMinLength('123456789012')).toEqual(false);
      expect(cardNumber.validateMinLength('1234567890123')).toEqual(true);
      expect(cardNumber.validateMinLength('1234567890123456')).toEqual(true);
      expect(cardNumber.validateMinLength('12345678901234567')).toEqual(true);
    });
  });
  describe('validateMaxLength', () => {
    it('should clean input', () => {
      spyOn(parsing, 'cleanInput').and.callThrough();
      cardNumber.validateMaxLength(123);
      expect(parsing.cleanInput).toHaveBeenCalledWith(123);
    });
    it('should validate the minimum length', () => {
      expect(cardNumber.validateMaxLength('123')).toEqual(true);
      expect(cardNumber.validateMaxLength('123456789012')).toEqual(true);
      expect(cardNumber.validateMaxLength('1234567890123')).toEqual(true);
      expect(cardNumber.validateMaxLength('1234567890123456')).toEqual(true);
      expect(cardNumber.validateMaxLength('12345678901234567')).toEqual(false);
      expect(cardNumber.validateMaxLength('123456789012345678')).toEqual(false);
    });
  });
  describe('validateKnownType', () => {
    it('should clean input', () => {
      spyOn(parsing, 'cleanInput').and.callThrough();
      cardNumber.validateKnownType(123);
      expect(parsing.cleanInput).toHaveBeenCalledWith(123);
    });
    it('should call validateKnownType', () => {
      spyOn(cardTypes, 'validateKnownType').and.returnValue(true);
      expect(cardNumber.validateKnownType('123')).toEqual(true);
      expect(cardTypes.validateKnownType).toHaveBeenCalledWith('123');
    });
  });
  describe('validateTypeLength', () => {
    it('should clean input', () => {
      spyOn(parsing, 'cleanInput').and.callThrough();
      cardNumber.validateTypeLength(123);
      expect(parsing.cleanInput).toHaveBeenCalledWith(123);
    });
    it('should call validateCardType', () => {
      spyOn(cardTypes, 'validateTypeLength').and.returnValue(true);
      expect(cardNumber.validateTypeLength('123')).toEqual(true);
      expect(cardTypes.validateTypeLength).toHaveBeenCalledWith('123');
    });
  });
  describe('validateChecksum', () => {
    it('should clean input', () => {
      spyOn(parsing, 'cleanInput').and.callThrough();
      cardNumber.validateChecksum(123);
      expect(parsing.cleanInput).toHaveBeenCalledWith(123);
    });
    it('should call validateCardType', () => {
      spyOn(luhn, 'luhnCheck').and.returnValue(true);
      expect(cardNumber.validateChecksum('123')).toEqual(true);
      expect(luhn.luhnCheck).toHaveBeenCalledWith('123');
    });
  });
  describe('validateAll', () => {
    it('should clean input', () => {
      spyOn(parsing, 'cleanInput').and.callThrough();
      cardNumber.validateAll(123);
      expect(parsing.cleanInput).toHaveBeenCalledWith(123);
    });
    it('should return true for valid card numbers', () => {
      // Visa
      expect(cardNumber.validateAll('4111111111111111')).toEqual(true);
      expect(cardNumber.validateAll('4716753357620591')).toEqual(true);
      expect(cardNumber.validateAll('4024007110320511')).toEqual(true);
      expect(cardNumber.validateAll('4916966873253758')).toEqual(true);
      expect(cardNumber.validateAll('4929268578447099')).toEqual(true);
      expect(cardNumber.validateAll('4024007192720596')).toEqual(true);
      // MasterCard
      expect(cardNumber.validateAll('5111111111111118')).toEqual(true);
      expect(cardNumber.validateAll('5335264303487729')).toEqual(true);
      expect(cardNumber.validateAll('5471854341982550')).toEqual(true);
      expect(cardNumber.validateAll('5240961814538643')).toEqual(true);
      expect(cardNumber.validateAll('5119639413189996')).toEqual(true);
      expect(cardNumber.validateAll('5116410773439691')).toEqual(true);
      expect(cardNumber.validateAll('2223000048400011')).toEqual(true);
      // Discover
      expect(cardNumber.validateAll('6011111111111117')).toEqual(true);
      expect(cardNumber.validateAll('6011529925138184')).toEqual(true);
      expect(cardNumber.validateAll('6011588261843393')).toEqual(true);
      expect(cardNumber.validateAll('6011575065399193')).toEqual(true);
      expect(cardNumber.validateAll('6011567753513011')).toEqual(true);
      expect(cardNumber.validateAll('6011603729578539')).toEqual(true);
      // American Express
      expect(cardNumber.validateAll('341111111111111')).toEqual(true);
      expect(cardNumber.validateAll('374874221687334')).toEqual(true);
      expect(cardNumber.validateAll('372018837309964')).toEqual(true);
      expect(cardNumber.validateAll('378693379562180')).toEqual(true);
      expect(cardNumber.validateAll('373330705156420')).toEqual(true);
      expect(cardNumber.validateAll('375395938958163')).toEqual(true);
      // Diners Club
      expect(cardNumber.validateAll('36111111111111')).toEqual(true);
      expect(cardNumber.validateAll('30060165822352')).toEqual(true);
      expect(cardNumber.validateAll('30239995413943')).toEqual(true);
      expect(cardNumber.validateAll('30307967235998')).toEqual(true);
      expect(cardNumber.validateAll('30028342701708')).toEqual(true);
      expect(cardNumber.validateAll('30151350318072')).toEqual(true);
    });
    it('should return false for invalid card numbers', () => {
      // Empty
      expect(cardNumber.validateAll(undefined)).toEqual(false);
      expect(cardNumber.validateAll(null)).toEqual(false);
      expect(cardNumber.validateAll('')).toEqual(false);
      // Too short
      expect(cardNumber.validateAll('4111111')).toEqual(false);
      expect(cardNumber.validateAll('411')).toEqual(false);
      // Too long
      expect(cardNumber.validateAll('4111111111111111111111')).toEqual(false);
      // Non digits
      expect(cardNumber.validateAll('abcdabcdabcdabcd')).toEqual(false);
      expect(cardNumber.validateAll('4lllllllllllllll')).toEqual(false);
      expect(cardNumber.validateAll('411111111111111l')).toEqual(false);
      // Unrecognized type
      expect(cardNumber.validateAll('0000000000000000')).toEqual(false);
      expect(cardNumber.validateAll('3510000000000000')).toEqual(false);
      expect(cardNumber.validateAll('3060000000000000')).toEqual(false);
      expect(cardNumber.validateAll('5800000000000000')).toEqual(false);
      // Incorrect length for a recognized type
      expect(cardNumber.validateAll('411111111111111')).toEqual(false);
      // Invalid luhn check
      expect(cardNumber.validateAll('5111111111111111')).toEqual(false);
    });
  });
  describe('errors', () => {
    it('should return errors for a card without enough digits', () => {
      expect(cardNumber.errors('123')).toEqual([
        'Card number must contain at least 13 digits',
        'Card type is not accepted by this system',
        'Card number is invalid. At least one digit was entered incorrectly.'
      ]);
    });
    it('should return errors for a card with too many digits', () => {
      expect(cardNumber.errors('12345678901234567')).toEqual([
        'Card number cannot contain more than 16 digits',
        'Card type is not accepted by this system',
        'Card number is invalid. At least one digit was entered incorrectly.'
      ]);
    });
    it('should return errors for a card with an unknown type', () => {
      expect(cardNumber.errors('1234567890123456')).toEqual([
        'Card type is not accepted by this system',
        'Card number is invalid. At least one digit was entered incorrectly.'
      ]);
    });
    it('should return errors for a card with known type but incorrect length', () => {
      expect(cardNumber.errors('41111111111111')).toEqual([
        'This is an invalid Visa number. It should have 13 or 16 digits but the number entered has 14.',
        'Card number is invalid. At least one digit was entered incorrectly.'
      ]);
    });
    it('should return errors for a card with an invalid luhn check', () => {
      expect(cardNumber.errors('4111111111111112')).toEqual([
        'Card number is invalid. At least one digit was entered incorrectly.'
      ]);
    });
    it('should return an empty array for a valid card', () => {
      expect(cardNumber.errors('4111111111111111')).toEqual([]);
    });
  });

  describe('getCardType', () => {
    it('should clean input', () => {
      spyOn(parsing, 'cleanInput').and.callThrough();
      cardNumber.getCardType(123);
      expect(parsing.cleanInput).toHaveBeenCalledWith(123);
    });
    it('should call getCardTypeName', () => {
      spyOn(cardTypes, 'getCardTypeName').and.returnValue('Visa');
      expect(cardNumber.getCardType('123')).toEqual('Visa');
      expect(cardTypes.getCardTypeName).toHaveBeenCalledWith('123');
    });
  });
});
