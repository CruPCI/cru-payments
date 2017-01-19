import {validateMonth, validateYear} from './expiry-date';

describe('expiry date', () => {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2015, 3, 1)); // Apr 01 2015
  });
  afterEach(function() {
    jasmine.clock().uninstall();
  });
  describe('validateMonth', () => {
    it('should return false if the month is out of range', () => {
      expect(validateMonth(0, 2016)).toEqual(false);
      expect(validateMonth(13, 2016)).toEqual(false);
    });
    it('should return false if the year is less than the current year', () => {
      expect(validateMonth(1, 2014)).toEqual(false);
      expect(validateMonth(6, 2013)).toEqual(false);
    });
    it('should return false if it is the current year but less than the current month', () => {
      expect(validateMonth(1, 2015)).toEqual(false);
      expect(validateMonth(3, 2015)).toEqual(false);
    });
    it('should return true if it is the current month', () => {
      expect(validateMonth(4, 2015)).toEqual(true);
    });
    it('should return true if it is greater than the current month', () => {
      expect(validateMonth(5, 2015)).toEqual(true);
      expect(validateMonth(8, 2015)).toEqual(true);
      expect(validateMonth(12, 2015)).toEqual(true);
    });
    it('should return true if it is greater than the current year', () => {
      expect(validateMonth(1, 2016)).toEqual(true);
      expect(validateMonth(6, 2016)).toEqual(true);
      expect(validateMonth(12, 2016)).toEqual(true);
      expect(validateMonth(1, 2017)).toEqual(true);
      expect(validateMonth(6, 2017)).toEqual(true);
      expect(validateMonth(12, 2017)).toEqual(true);
    });
    it('should support string inputs', () => {
      expect(validateMonth('0', '2016')).toEqual(false);
      expect(validateMonth('12', '2016')).toEqual(true);
    });
  });
  describe('validateYear', () => {
    it('should return false if the year is less than the current year', () => {
      expect(validateYear(2013)).toEqual(false);
      expect(validateYear(2014)).toEqual(false);
    });
    it('should return true if it is the current year', () => {
      expect(validateYear(2015)).toEqual(true);
      expect(validateYear(2015)).toEqual(true);
    });
    it('should return true if it is greater than the current year', () => {
      expect(validateYear(2016)).toEqual(true);
      expect(validateYear(2017)).toEqual(true);
    });
    it('should support string inputs', () => {
      expect(validateYear('2014')).toEqual(false);
      expect(validateYear('2015')).toEqual(true);
      expect(validateYear('2016')).toEqual(true);
    });
  });
});
