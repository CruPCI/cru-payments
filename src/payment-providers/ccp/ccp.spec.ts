import * as ccp from './ccp';

import {Promise} from 'es6-promise';

describe('ccp', () => {
  describe('init', () => {
    beforeEach(() => {
      spyOn((<any> window), 'fetch');
    });
    it('should use the backup key provided if there\'s a network error while fetching the key', (done) => {
      (<any> window).fetch.and.callFake(() => Promise.reject('network error'));
      ccp.init('staging', '<backup key>');
      ccp._ccpKeyObservable
        .subscribe(key => {
          expect(key).toEqual('<backup key>');
          expect((<any> window).fetch).toHaveBeenCalledWith('https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current');
          done();
        }, () => done.fail('should not have thrown an error'));
    });
    it('should use the backup key provided if the api returns a non-ok status code while fetching the key', (done) => {
      (<any> window).fetch.and.callFake(() => Promise.resolve({ ok: false }));
      ccp.init('staging', '<backup key>');
      ccp._ccpKeyObservable
        .subscribe(key => {
          expect(key).toEqual('<backup key>');
          expect((<any> window).fetch).toHaveBeenCalledWith('https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current');
          done();
        }, () => done.fail('should not have thrown an error'));
    });
    it('should throw an error if no backup key was provided and there was a network error fetching the key from the api', (done) => {
      (<any> window).fetch.and.callFake(() => Promise.reject('network error'));
      ccp.init('staging');
      ccp._ccpKeyObservable
        .subscribe(() => done.fail('should not have thrown an error'),
          error => {
            expect(error).toEqual('There was an error retrieving the key from CCP and no backup key was provided: network error');
            expect((<any> window).fetch).toHaveBeenCalledWith('https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current');
            done();
          });
    });
    it('should throw an error if no backup key was provided and there was an error fetching the key from the api', (done) => {
      (<any> window).fetch.and.callFake(() => Promise.resolve({ ok: false, statusText: 'Unauthorized' }));
      ccp.init('staging');
      ccp._ccpKeyObservable
        .subscribe(() => done.fail('should not have thrown an error'),
          error => {
            expect(error).toEqual('There was an error retrieving the key from CCP and no backup key was provided: Unauthorized');
            expect((<any> window).fetch).toHaveBeenCalledWith('https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current');
            done();
          });
    });
    it('should use the key returned by the api', (done) => {
      (<any> window).fetch.and.callFake(() => Promise.resolve({ ok: true, text: () => '<key from api>' }));
      ccp.init('staging', '<backup key>');
      ccp._ccpKeyObservable
        .subscribe(key => {
          expect(key).toEqual('<key from api>');
          expect((<any> window).fetch).toHaveBeenCalledWith('https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current');
          done();
        }, () => done.fail('should not have thrown an error'));
    });
    it('should use the key returned by the production api', (done) => {
      (<any> window).fetch.and.callFake(() => Promise.resolve({ ok: true, text: () => '<key from api>' }));
      ccp.init('production', '<backup key>');
      ccp._ccpKeyObservable
        .subscribe(key => {
          expect(key).toEqual('<key from api>');
          expect((<any> window).fetch).toHaveBeenCalledWith('https://ccp.ccci.org/api/v1/rest/client-encryption-keys/current');
          done();
        }, () => done.fail('should not have thrown an error'));
    });
  });
  describe('encrypt', () => {
    beforeEach(() => {
      // Setup ccp to use provided backup key
      spyOn((<any> window), 'fetch').and.callFake(() => Promise.reject('network error'));
      this.validKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0
FPqri0cb2JZfXJ/DgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/
3j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQAB
-----END PUBLIC KEY-----`;
    });
    it('should throw an error if init has not been called', (done) => {
      ccp._clear();
      ccp.encrypt('1234567890123456')
        .subscribe(() => done.fail('should have thrown an error'),
          error => {
            expect(error).toEqual('init must be called first');
            done();
          });
    });
    it('should throw an error if the key is invalid', (done) => {
      ccp.init('staging', '<backup key>');
      ccp.encrypt('1234567890123456')
        .subscribe(() => {
          done.fail('should have thrown an error');
        }, error => {
          expect(error).toEqual('Error encrypting bank account number');
          done();
        });
    });
    it('should return the encrypted account number', (done) => {
      ccp.init('staging', this.validKey);
      ccp.encrypt('1234567890123456')
        .subscribe(value => {
          expect((<string> value).length).toBeGreaterThan(50);
          done();
        }, () => done.fail('should not have thrown an error'));
    });
  });
});
