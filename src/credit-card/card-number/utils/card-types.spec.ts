import * as cardTypes from './card-types';

describe('card types', () => {
  describe('validateKnownType', () => {
    it('should return true for known types', () => {
      // Valid length for type
      expect(cardTypes.validateKnownType('4111111111111')).toEqual(true);
      expect(cardTypes.validateKnownType('4111111111111111')).toEqual(true);
      expect(cardTypes.validateKnownType('5111111111111118')).toEqual(true);
      expect(cardTypes.validateKnownType('2223000048400011')).toEqual(true);
      expect(cardTypes.validateKnownType('6011111111111117')).toEqual(true);
      expect(cardTypes.validateKnownType('341111111111111')).toEqual(true);
      expect(cardTypes.validateKnownType('36111111111111')).toEqual(true);

      // Invalid length for type
      expect(cardTypes.validateKnownType('4')).toEqual(true);
      expect(cardTypes.validateKnownType('41111111111111')).toEqual(true);
      expect(cardTypes.validateKnownType('411111111111111')).toEqual(true);
      expect(cardTypes.validateKnownType('511111111111111')).toEqual(true);
      expect(cardTypes.validateKnownType('601111111111111')).toEqual(true);
      expect(cardTypes.validateKnownType('34111111111111')).toEqual(true);
      expect(cardTypes.validateKnownType('3611111111111')).toEqual(true);
      expect(cardTypes.validateKnownType('38')).toEqual(true);
    });
    it('should return false for unknown types', () => {
      expect(cardTypes.validateKnownType('1')).toEqual(false);
      expect(cardTypes.validateKnownType('1111111111111111')).toEqual(false);
      expect(cardTypes.validateKnownType('50')).toEqual(false);
      expect(cardTypes.validateKnownType('57')).toEqual(false);
    });
  });
  describe('validateTypeLength', () => {
    it('should return true for valid numbers', () => {
      expect(cardTypes.validateTypeLength('4111111111111')).toEqual(true);
      expect(cardTypes.validateTypeLength('4111111111111111')).toEqual(true);
      expect(cardTypes.validateTypeLength('5111111111111118')).toEqual(true);
      expect(cardTypes.validateTypeLength('6011111111111117')).toEqual(true);
      expect(cardTypes.validateTypeLength('341111111111111')).toEqual(true);
      expect(cardTypes.validateTypeLength('36111111111111')).toEqual(true);
    });
    it('should return false for invalid numbers', () => {
      expect(cardTypes.validateTypeLength('41111111111111')).toEqual(false);
      expect(cardTypes.validateTypeLength('411111111111111')).toEqual(false);
      expect(cardTypes.validateTypeLength('511111111111111')).toEqual(false);
      expect(cardTypes.validateTypeLength('601111111111111')).toEqual(false);
      expect(cardTypes.validateTypeLength('34111111111111')).toEqual(false);
      expect(cardTypes.validateTypeLength('3611111111111')).toEqual(false);
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
      expect(cardTypes.getCardTypeName('530000000000000000')).toEqual(
        'MasterCard',
      );
      expect(cardTypes.getCardTypeName('540000000000000000')).toEqual(
        'MasterCard',
      );
      expect(cardTypes.getCardTypeName('550000000000000000')).toEqual(
        'MasterCard',
      );
      expect(cardTypes.getCardTypeName('2221')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('2229')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('223')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('229')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('23')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('26')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('270')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('271')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('2720')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('2223000048400011')).toEqual(
        'MasterCard',
      );
    });
    it('should detect American Express correctly', () => {
      expect(cardTypes.getCardTypeName('34')).toEqual('American Express');
      expect(cardTypes.getCardTypeName('37')).toEqual('American Express');
      expect(cardTypes.getCardTypeName('34000000000000000')).toEqual(
        'American Express',
      );
      expect(cardTypes.getCardTypeName('37000000000000000')).toEqual(
        'American Express',
      );
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
      expect(cardTypes.getCardTypeName('38')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('300')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('301')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('302')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('303')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('304')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('305')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('36000000000000')).toEqual(
        'Diners Club',
      );
    });
    it('should return an empty string for an unknown type', () => {
      expect(cardTypes.getCardTypeName('39')).toEqual('');
      expect(cardTypes.getCardTypeName('111111111')).toEqual('');
      expect(cardTypes.getCardTypeName('33333')).toEqual('');
    });
  });

  describe('expectedLength', () => {
    it('should return the expected length for a given type', () => {
      expect(cardTypes.expectedLength('4111111111111')).toEqual([13, 16]);
      expect(cardTypes.expectedLength('51')).toEqual([16]);
      expect(cardTypes.expectedLength('34')).toEqual([15]);
    });
    it('should return undefined for an unknown type', () => {
      expect(cardTypes.expectedLength('11')).toEqual(undefined);
      expect(cardTypes.expectedLength('39')).toEqual(undefined);
    });
  });
});
