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
      expect(cardTypes.validateKnownType('3600000000000008')).toEqual(true);
      expect(cardTypes.validateKnownType('3900000000000005')).toEqual(true);
      expect(cardTypes.validateKnownType('3095000000000000')).toEqual(true);
      expect(cardTypes.validateKnownType('3528000000000007')).toEqual(true);
      expect(cardTypes.validateKnownType('6221260000000000')).toEqual(true);
      expect(cardTypes.validateKnownType('6229250000000003')).toEqual(true);

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
      // JCB starts at 3528; 3520-3527 are not issuable
      expect(cardTypes.validateKnownType('3520000000000005')).toEqual(false);
      expect(cardTypes.validateKnownType('3527000000000000')).toEqual(false);
      // UnionPay/Discover interop range starts at 622126
      expect(cardTypes.validateKnownType('6221250000000000')).toEqual(false);
      // and ends at 622925
      expect(cardTypes.validateKnownType('6229260000000000')).toEqual(false);
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
      expect(cardTypes.validateTypeLength('3600000000000008')).toEqual(true);
      expect(cardTypes.validateTypeLength('3900000000000005')).toEqual(true);
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
      expect(cardTypes.getCardTypeName('530000000000000000')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('540000000000000000')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('550000000000000000')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('2221')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('2229')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('223')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('229')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('23')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('26')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('270')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('271')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('2720')).toEqual('MasterCard');
      expect(cardTypes.getCardTypeName('2223000048400011')).toEqual('MasterCard');
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
      expect(cardTypes.getCardTypeName('6011')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('6500000000000000')).toEqual('Discover');
      // UnionPay/Discover interop range is 622126-622925
      expect(cardTypes.getCardTypeName('622126')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622129')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622130')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622199')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622200')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622899')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622900')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622919')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622920')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('622925')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('6221260000000000')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('6229250000000003')).toEqual('Discover');
      // JCB range is 3528-3589
      expect(cardTypes.getCardTypeName('3528')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('3529')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('3530')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('3540')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('3589')).toEqual('Discover');
      expect(cardTypes.getCardTypeName('3528000000000007')).toEqual('Discover');
    });
    it('should detect Diners Club correctly', () => {
      expect(cardTypes.getCardTypeName('36')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('38')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('39')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('3095')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('300')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('301')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('302')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('303')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('304')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('305')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('36000000000000')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('3600000000000008')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('3900000000000005')).toEqual('Diners Club');
      expect(cardTypes.getCardTypeName('3095000000000000')).toEqual('Diners Club');
    });
    it('should return an empty string for an unknown type', () => {
      expect(cardTypes.getCardTypeName('111111111')).toEqual('');
      expect(cardTypes.getCardTypeName('33333')).toEqual('');
      // 3520-3527 is below the JCB range
      expect(cardTypes.getCardTypeName('3520')).toEqual('');
      expect(cardTypes.getCardTypeName('3527')).toEqual('');
      expect(cardTypes.getCardTypeName('3520000000000005')).toEqual('');
      // 3590 and up is above the JCB range
      expect(cardTypes.getCardTypeName('3590')).toEqual('');
      // outside the UnionPay/Discover interop range of 622126-622925
      expect(cardTypes.getCardTypeName('622125')).toEqual('');
      expect(cardTypes.getCardTypeName('622926')).toEqual('');
      expect(cardTypes.getCardTypeName('6221250000000000')).toEqual('');
      expect(cardTypes.getCardTypeName('6229260000000000')).toEqual('');
      // 306-308 and 3090-3094, 3096-3099 are not Diners Club
      expect(cardTypes.getCardTypeName('306')).toEqual('');
      expect(cardTypes.getCardTypeName('3094')).toEqual('');
      expect(cardTypes.getCardTypeName('3096')).toEqual('');
    });
  });

  describe('expectedLength', () => {
    it('should return the expected length for a given type', () => {
      expect(cardTypes.expectedLength('4111111111111')).toEqual([13,16]);
      expect(cardTypes.expectedLength('51')).toEqual([16]);
      expect(cardTypes.expectedLength('34')).toEqual([15]);
      expect(cardTypes.expectedLength('36')).toEqual([14, 16]);
      expect(cardTypes.expectedLength('39')).toEqual([14, 16]);
    });
    it('should return undefined for an unknown type', () => {
      expect(cardTypes.expectedLength('11')).toEqual(undefined);
      expect(cardTypes.expectedLength('31')).toEqual(undefined);
    });
  });
});
