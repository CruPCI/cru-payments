import {validateExpiryDate} from './expiry-date';

describe('expiry date', () => {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2015, 3, 1)); // Apr 01 2015
  });
  afterEach(function() {
    jasmine.clock().uninstall();
  });
  describe('validateExpiryDate', () => {
    it('should return false if the month is out of range', () => {
      expect(validateExpiryDate(0, 2016)).toEqual(false);
      expect(validateExpiryDate(13, 2016)).toEqual(false);
    });
    it('should return false if the year is less than the current year', () => {
      expect(validateExpiryDate(1, 2014)).toEqual(false);
      expect(validateExpiryDate(6, 2013)).toEqual(false);
    });
    it('should return false if it is the current year but less than the current month', () => {
      expect(validateExpiryDate(1, 2015)).toEqual(false);
      expect(validateExpiryDate(3, 2015)).toEqual(false);
    });
    it('should return true if it is the current month', () => {
      expect(validateExpiryDate(4, 2015)).toEqual(true);
    });
    it('should return true if it is greater than the current month', () => {
      expect(validateExpiryDate(5, 2015)).toEqual(true);
      expect(validateExpiryDate(8, 2015)).toEqual(true);
      expect(validateExpiryDate(12, 2015)).toEqual(true);
    });
    it('should return true if it is greater than the current year', () => {
      expect(validateExpiryDate(1, 2016)).toEqual(true);
      expect(validateExpiryDate(6, 2016)).toEqual(true);
      expect(validateExpiryDate(12, 2016)).toEqual(true);
      expect(validateExpiryDate(1, 2017)).toEqual(true);
      expect(validateExpiryDate(6, 2017)).toEqual(true);
      expect(validateExpiryDate(12, 2017)).toEqual(true);
    });
  });
});
