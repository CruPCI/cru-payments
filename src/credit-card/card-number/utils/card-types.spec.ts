import * as cardTypes from './card-types';

describe('card types', () => {
  describe('validateCardType', () => {
    it('should return true for valid numbers', () => {
      expect(cardTypes.validateCardType('4111111111111')).toEqual(true);
      expect(cardTypes.validateCardType('4111111111111111')).toEqual(true);
      expect(cardTypes.validateCardType('5111111111111118')).toEqual(true);
      expect(cardTypes.validateCardType('6011111111111117')).toEqual(true);
      expect(cardTypes.validateCardType('341111111111111')).toEqual(true);
      expect(cardTypes.validateCardType('36111111111111')).toEqual(true);
    });
    it('should return false for invalid numbers', () => {
      expect(cardTypes.validateCardType('41111111111111')).toEqual(false);
      expect(cardTypes.validateCardType('411111111111111')).toEqual(false);
      expect(cardTypes.validateCardType('511111111111111')).toEqual(false);
      expect(cardTypes.validateCardType('601111111111111')).toEqual(false);
      expect(cardTypes.validateCardType('34111111111111')).toEqual(false);
      expect(cardTypes.validateCardType('3611111111111')).toEqual(false);
    });
  });

  describe('getCardTypeName', () => {
    it('should detect Visa correctly', () => {
      expect(cardTypes.getCardTypeName('4')).toEqual('Visa');
      expect(cardTypes.getCardTypeName('4321')).toEqual('Visa');
      expect(cardTypes.getCardTypeName('4111111111111')).toEqual('Visa');
      expect(cardTypes.getCardTypeName('4111111111111111')).toEqual('Visa');
    });
    it('should detect MasterCard correctly', () => {
      expect(cardTypes.getCardTypeName('51')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('52')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('530000000000000000')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('540000000000000000')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('550000000000000000')).toEqual('MasterCard');
    });
    it('should detect American Express correctly', () => {
      expect(cardTypes.getCardTypeName('34')).toEqual('American Express');
      expect(cardTypes.getCardTypeName('37')).toEqual('American Express');
      expect(cardTypes.getCardTypeName('34000000000000000')).toEqual('American Express');
      expect(cardTypes.getCardTypeName('37000000000000000')).toEqual('American Express');
    });
    it('should detect Discover correctly', () => {
      expect(cardTypes.getCardTypeName('65')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('644')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('645')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('646')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('647')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('648')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('649')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('6011')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('352')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('353')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('354')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('355')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('356')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('357')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('358')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('6500000000000000')).toEqual('Discover');
    });
    it('should detect Diners Club correctly', () => {
      expect(cardTypes.getCardTypeName('36')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('300')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('301')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('302')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('303')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('304')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('305')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('36000000000000')).toEqual('Diners Club');
    });
  });

  describe('getCardTypeError', () => {
    it('should return no errors if card is valid', () => {
      expect(cardTypes.getCardTypeError('4111111111111')).toEqual('');
      expect(cardTypes.getCardTypeError('6011111111111117')).toEqual('');
    });
    it('should return an error if card type is unknown', () => {
      expect(cardTypes.getCardTypeError('7')).toEqual('Card type is not accepted by this system');
      expect(cardTypes.getCardTypeError('6248291239482947')).toEqual('Card type is not accepted by this system');
      expect(cardTypes.getCardTypeError('1234567890123456')).toEqual('Card type is not accepted by this system');
      expect(cardTypes.getCardTypeError('999999')).toEqual('Card type is not accepted by this system');
      expect(cardTypes.getCardTypeError('7771234')).toEqual('Card type is not accepted by this system');
    });
    it('should return an error if card type is known but the length is invalid', () => {
      expect(cardTypes.getCardTypeError('41111111111111')).toEqual('This is an invalid Visa number. It should have 13 or 16 digits but the number entered has 14.');
      expect(cardTypes.getCardTypeError('510000000000000')).toEqual('This is an invalid MasterCard number. It should have 16 digits but the number entered has 15.');
      expect(cardTypes.getCardTypeError('34000000000000')).toEqual('This is an invalid American Express number. It should have 15 digits but the number entered has 14.');
    });
  });
});
