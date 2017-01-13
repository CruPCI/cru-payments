import * as bankAccount from './bank-account';

describe('bank account', () => {

  describe('validateRoutingNumber', () => {
    it('should return true for valid routing numbers', () => {
      expect(bankAccount.validateRoutingNumber(267084131)).toEqual(true);
      expect(bankAccount.validateRoutingNumber('021300420')).toEqual(true);
      expect(bankAccount.validateRoutingNumber('043318092')).toEqual(true);
      expect(bankAccount.validateRoutingNumber(122038251)).toEqual(true);
      expect(bankAccount.validateRoutingNumber(300000001)).toEqual(true);
    });
    it('should return false for invalid routing numbers', () => {
      expect(bankAccount.validateRoutingNumber('000000000')).toEqual(false); // sum of 0
      expect(bankAccount.validateRoutingNumber(400000008)).toEqual(false); // number that starts above 3 with a valid checksum
      expect(bankAccount.validateRoutingNumber(800000006)).toEqual(false); // number that starts above 3 with a valid checksum
      expect(bankAccount.validateRoutingNumber(267084132)).toEqual(false);
      expect(bankAccount.validateRoutingNumber(121300420)).toEqual(false);
      expect(bankAccount.validateRoutingNumber(943318092)).toEqual(false);
      expect(bankAccount.validateRoutingNumber(122030251)).toEqual(false);
      expect(bankAccount.validateRoutingNumber()).toEqual(false);
      expect(bankAccount.validateRoutingNumber(undefined)).toEqual(false);
      expect(bankAccount.validateRoutingNumber(null)).toEqual(false);
      expect(bankAccount.validateRoutingNumber('')).toEqual(false);
      expect(bankAccount.validateRoutingNumber(1)).toEqual(false);
      expect(bankAccount.validateRoutingNumber(12345678)).toEqual(false);
      expect(bankAccount.validateRoutingNumber(1234567890)).toEqual(false);
      expect(bankAccount.validateRoutingNumber(1234567890123456)).toEqual(false);
    });
  });
});
