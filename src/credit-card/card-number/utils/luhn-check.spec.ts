import { luhnCheck } from './luhn-check';

describe('luhnCheck', () => {
  it('should return true for valid numbers', () => {
    expect(luhnCheck('4111111111111111')).toEqual(true);
    expect(luhnCheck('5111111111111118')).toEqual(true);
    expect(luhnCheck('6011111111111117')).toEqual(true);
    expect(luhnCheck('341111111111111')).toEqual(true);
    expect(luhnCheck('36111111111111')).toEqual(true);
    expect(luhnCheck('4408041234567893')).toEqual(true);
  });
  it('should return false for invalid numbers', () => {
    expect(luhnCheck('4111111111111112')).toEqual(false);
    expect(luhnCheck('5111111111111111')).toEqual(false);
    expect(luhnCheck('4408041234567892')).toEqual(false);
  });
});
