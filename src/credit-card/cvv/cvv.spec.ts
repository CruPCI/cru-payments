import * as cvv from './cvv';
import * as parsing from '../../utils/parsing';

describe('cvv', () => {
  describe('validateMinLength', () => {
    it('should clean input', () => {
      spyOn(parsing, 'cleanInput').and.callThrough();
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
      spyOn(parsing, 'cleanInput').and.callThrough();
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
  describe('validateAll', () => {
    it('should return true if cvv is valid', () => {
      expect(cvv.validateAll(123)).toEqual(true);
      expect(cvv.validateAll(1234)).toEqual(true);
      expect(cvv.validateAll('123')).toEqual(true);
      expect(cvv.validateAll('1234')).toEqual(true);
      expect(cvv.validateAll(9876)).toEqual(true);
      expect(cvv.validateAll('987')).toEqual(true);
    });
    it('should return false if if cvv is invalid', () => {
      expect(cvv.validateAll(undefined)).toEqual(false);
      expect(cvv.validateAll(null)).toEqual(false);
      expect(cvv.validateAll('')).toEqual(false);
      expect(cvv.validateAll(1)).toEqual(false);
      expect(cvv.validateAll(12)).toEqual(false);
      expect(cvv.validateAll('12')).toEqual(false);
      expect(cvv.validateAll(12345)).toEqual(false);
      expect(cvv.validateAll('12345')).toEqual(false);
      expect(cvv.validateAll('123456')).toEqual(false);
      expect(cvv.validateAll(1234567)).toEqual(false);
    });
  });
});
