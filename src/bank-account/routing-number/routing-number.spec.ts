import * as routingNumber from './routing-number';

describe('routing number', () => {
  describe('validateLength', () => {
    it('should return true for valid routing numbers', () => {
      expect(routingNumber.validateLength(267084131)).toEqual(true);
      expect(routingNumber.validateLength('021300420')).toEqual(true);
      expect(routingNumber.validateLength('043318092')).toEqual(true);
      expect(routingNumber.validateLength(122038251)).toEqual(true);
      expect(routingNumber.validateLength(300000001)).toEqual(true);
      expect(routingNumber.validateLength('043-318-092')).toEqual(true);
      expect(routingNumber.validateLength('043-318-092njkjknjk&#*@')).toEqual(
        true,
      );
      expect(routingNumber.validateLength('000000000')).toEqual(true); // sum of 0
      expect(routingNumber.validateLength(400000008)).toEqual(true); // number that starts above 3 with a valid checksum
      expect(routingNumber.validateLength(800000006)).toEqual(true); // number that starts above 3 with a valid checksum
      expect(routingNumber.validateLength(267084132)).toEqual(true);
      expect(routingNumber.validateLength(121300420)).toEqual(true);
      expect(routingNumber.validateLength(943318092)).toEqual(true);
      expect(routingNumber.validateLength(122030251)).toEqual(true);
    });
    it('should return false for invalid routing numbers', () => {
      expect(routingNumber.validateLength()).toEqual(false);
      expect(routingNumber.validateLength(undefined)).toEqual(false);
      expect(routingNumber.validateLength(null)).toEqual(false);
      expect(routingNumber.validateLength('')).toEqual(false);
      expect(routingNumber.validateLength(1)).toEqual(false);
      expect(routingNumber.validateLength(12345678)).toEqual(false);
      expect(routingNumber.validateLength(1234567890)).toEqual(false);
      expect(routingNumber.validateLength(1234567890123456)).toEqual(false);
    });
  });

  describe('validateChecksum', () => {
    it('should return true for valid routing numbers', () => {
      expect(routingNumber.validateChecksum(267084131)).toEqual(true);
      expect(routingNumber.validateChecksum('021300420')).toEqual(true);
      expect(routingNumber.validateChecksum('043318092')).toEqual(true);
      expect(routingNumber.validateChecksum(122038251)).toEqual(true);
      expect(routingNumber.validateChecksum(300000001)).toEqual(true);
      expect(routingNumber.validateChecksum('043-318-092')).toEqual(true);
      expect(routingNumber.validateChecksum('043-318-092njkjknjk&#*@')).toEqual(
        true,
      );
    });
    it('should return false for invalid routing numbers', () => {
      expect(routingNumber.validateChecksum('000000000')).toEqual(false); // sum of 0
      expect(routingNumber.validateChecksum(400000008)).toEqual(false); // number that starts above 3 with a valid checksum
      expect(routingNumber.validateChecksum(800000006)).toEqual(false); // number that starts above 3 with a valid checksum
      expect(routingNumber.validateChecksum(267084132)).toEqual(false);
      expect(routingNumber.validateChecksum(121300420)).toEqual(false);
      expect(routingNumber.validateChecksum(943318092)).toEqual(false);
      expect(routingNumber.validateChecksum(122030251)).toEqual(false);
      expect(routingNumber.validateChecksum()).toEqual(false);
      expect(routingNumber.validateChecksum(undefined)).toEqual(false);
      expect(routingNumber.validateChecksum(null)).toEqual(false);
      expect(routingNumber.validateChecksum('')).toEqual(false);
      expect(routingNumber.validateChecksum(1)).toEqual(false);
      expect(routingNumber.validateChecksum(12345678)).toEqual(false);
      expect(routingNumber.validateChecksum(1234567890)).toEqual(false);
      expect(routingNumber.validateChecksum(1234567890123456)).toEqual(false);
    });
  });

  describe('validateAll', () => {
    it('should return true for valid routing numbers', () => {
      expect(routingNumber.validateAll(267084131)).toEqual(true);
      expect(routingNumber.validateAll('021300420')).toEqual(true);
      expect(routingNumber.validateAll('043318092')).toEqual(true);
      expect(routingNumber.validateAll(122038251)).toEqual(true);
      expect(routingNumber.validateAll(300000001)).toEqual(true);
      expect(routingNumber.validateAll('043-318-092')).toEqual(true);
      expect(routingNumber.validateAll('043-318-092njkjknjk&#*@')).toEqual(
        true,
      );
    });
    it('should return false for invalid routing numbers', () => {
      expect(routingNumber.validateAll('000000000')).toEqual(false); // sum of 0
      expect(routingNumber.validateAll(400000008)).toEqual(false); // number that starts above 3 with a valid checksum
      expect(routingNumber.validateAll(800000006)).toEqual(false); // number that starts above 3 with a valid checksum
      expect(routingNumber.validateAll(267084132)).toEqual(false);
      expect(routingNumber.validateAll(121300420)).toEqual(false);
      expect(routingNumber.validateAll(943318092)).toEqual(false);
      expect(routingNumber.validateAll(122030251)).toEqual(false);
      expect(routingNumber.validateAll(undefined)).toEqual(false);
      expect(routingNumber.validateAll(null)).toEqual(false);
      expect(routingNumber.validateAll('')).toEqual(false);
      expect(routingNumber.validateAll(1)).toEqual(false);
      expect(routingNumber.validateAll(12345678)).toEqual(false);
      expect(routingNumber.validateAll(1234567890)).toEqual(false);
      expect(routingNumber.validateAll(1234567890123456)).toEqual(false);
    });
  });
  describe('errors', () => {
    it('should return errors for an empty routing number', () => {
      expect(routingNumber.errors('')).toEqual([
        'Routing number cannot be blank',
        'Routing number must contain 9 digits',
        'Routing number is invalid. At least one digit was entered incorrectly.',
      ]);
    });
    it('should return errors for a routing number without the correct number of digits', () => {
      expect(routingNumber.errors('12345678')).toEqual([
        'Routing number must contain 9 digits',
        'Routing number is invalid. At least one digit was entered incorrectly.',
      ]);
    });
    it('should return errors for a routing number with an invalid checksum', () => {
      expect(routingNumber.errors('123456789')).toEqual([
        'Routing number is invalid. At least one digit was entered incorrectly.',
      ]);
    });
    it('should return an empty array for a valid routing number', () => {
      expect(routingNumber.errors('021000021')).toEqual([]);
    });
  });
});
