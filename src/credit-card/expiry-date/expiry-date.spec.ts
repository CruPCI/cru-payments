import {validateMonth, validateYear, errors} from './expiry-date';

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
    it('should support 2-digit years', () => {
      const currentTwoDigitYear = new Date().getFullYear() - 2000; // 15
      expect(validateMonth(1, currentTwoDigitYear - 1)).toEqual(false); // '14' is in the past
      expect(validateMonth(3, String(currentTwoDigitYear))).toEqual(false); // month in the past of '15'
      expect(validateMonth(4, String(currentTwoDigitYear))).toEqual(true); // current month of '15'
      expect(validateMonth('12', String(currentTwoDigitYear + 1))).toEqual(true); // '16' is in the future
      expect(validateMonth('12', '28')).toEqual(true);
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
    it('should support 2-digit years', () => {
      const currentTwoDigitYear = new Date().getFullYear() - 2000; // 15
      expect(validateYear(String(currentTwoDigitYear - 1))).toEqual(false); // '14' is in the past
      expect(validateYear(String(currentTwoDigitYear))).toEqual(true); // '15' is the current year
      expect(validateYear(currentTwoDigitYear + 1)).toEqual(true); // '16' is in the future
      expect(validateYear('28')).toEqual(true);
    });
    it('should return false if the year is more than 50 years in the future', () => {
      const currentYear = new Date().getFullYear(); // 2015
      expect(validateYear(currentYear + 50)).toEqual(true);
      expect(validateYear(currentYear + 51)).toEqual(false);
      expect(validateYear('99')).toEqual(false); // 2099 is too far in the future
      expect(validateYear(9999)).toEqual(false);
    });
  });
  describe('errors', () => {
    it('should return errors for an empty month and year', () => {
      expect(errors('', '')).toEqual([
        'Month cannot be blank',
        'Year cannot be blank'
      ]);
    });
    it('should return errors for an empty month', () => {
      expect(errors('', '2015')).toEqual([
        'Month cannot be blank'
      ]);
    });
    it('should return errors for an empty year', () => {
      expect(errors('5', '')).toEqual([
        'Year cannot be blank',
        'Month cannot be in the past'
      ]);
    });
    it('should return errors for an invalid month', () => {
      expect(errors('3', '2015')).toEqual([
        'Month cannot be in the past'
      ]);
    });
    it('should return errors for an invalid year', () => {
      expect(errors('6', '2014')).toEqual([
        'Year cannot be in the past',
        'Month cannot be in the past'
      ]);
    });
    it('should return an empty array for a valid month and year', () => {
      expect(errors('5', '2015')).toEqual([]);
    });
    it('should return errors for an invalid 2-digit year', () => {
      const pastTwoDigitYear = String(new Date().getFullYear() - 2000 - 1); // '14'
      expect(errors('6', pastTwoDigitYear)).toEqual([
        'Year cannot be in the past',
        'Month cannot be in the past'
      ]);
    });
    it('should return errors for a year too far in the future', () => {
      const farFutureYear = String(new Date().getFullYear() + 51); // '2066'
      expect(errors('6', farFutureYear)).toEqual([
        'Year is too far in the future'
      ]);
    });
    it('should return an empty array for a valid month and 2-digit year', () => {
      const currentTwoDigitYear = String(new Date().getFullYear() - 2000); // '15'
      expect(errors('5', currentTwoDigitYear)).toEqual([]);
      expect(errors('12', '28')).toEqual([]);
    });
  });
});
