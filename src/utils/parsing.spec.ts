import * as utils from './parsing';

describe('utils', () => {
  describe('stripNonDigits', () => {
    it('should remove all non digits from a string', () => {
      expect(utils.stripNonDigits('12')).toEqual('12');
      expect(utils.stripNonDigits('12345')).toEqual('12345');
      expect(utils.stripNonDigits('&1a23-4 5')).toEqual('12345');
      expect(utils.stripNonDigits('1234567890')).toEqual('1234567890');
      expect(utils.stripNonDigits('!@#1 23_4567-89 0 ')).toEqual('1234567890');
    });
  });
  describe('cleanInput', () => {
    it('should convert input to string and remove all non digits from a string', () => {
      expect(utils.cleanInput('12')).toEqual('12');
      expect(utils.cleanInput('12345')).toEqual('12345');
      expect(utils.cleanInput('&1a23-4 5')).toEqual('12345');
      expect(utils.cleanInput('1234567890')).toEqual('1234567890');
      expect(utils.cleanInput('!@#1 23_4567-89 0 ')).toEqual('1234567890');
      expect(utils.cleanInput(1234567890)).toEqual('1234567890');
      expect(utils.cleanInput(0)).toEqual('0');
      expect(utils.cleanInput('')).toEqual('');
      expect(utils.cleanInput(undefined)).toEqual('');
      expect(utils.cleanInput(null)).toEqual('');
    });
  });
});
