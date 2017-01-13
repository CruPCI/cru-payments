import * as index from './index';

describe('index', () => {
  it('should export bank account and credit card methods', () => {
    expect(index.bankAccount).toEqual(jasmine.any(Object));
    expect(index.creditCard).toEqual(jasmine.any(Object));
  });
});
