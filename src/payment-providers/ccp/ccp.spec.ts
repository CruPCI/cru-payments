import * as ccp from './ccp';
import * as fetchMock from 'fetch-mock';

const stagingKeyUri = 'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current';
const validKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0
FPqri0cb2JZfXJ/DgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/
3j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQAB
-----END PUBLIC KEY-----`;

describe('ccp', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  describe('init', () => {
    it('should use the backup key provided if there\'s a network error while fetching the key', (done) => {
      spyOn(console, 'warn');
      fetchMock.once(
        stagingKeyUri,
        { throws: new TypeError('Failed to fetch') }
      );
      ccp.init('staging', '<backup key>');
      ccp._ccpKeyObservable
        .subscribe(key => {
          expect(key).toEqual('<backup key>');
          done();
        }, () => done.fail('should not have thrown an error'));
    });
    it('should use the backup key provided if the api returns a non-ok status code while fetching the key', (done) => {
      spyOn(console, 'warn');
      fetchMock.once(
        stagingKeyUri,
        500
      );
      ccp.init('staging', '<backup key>');
      ccp._ccpKeyObservable
        .subscribe(key => {
          expect(key).toEqual('<backup key>');
          done();
        }, () => done.fail('should not have thrown an error'));
    });
    it('should warn via console.warn when falling back to the backup key', (done) => {
      spyOn(console, 'warn');
      fetchMock.once(
        stagingKeyUri,
        500
      );
      ccp.init('staging', '<backup key>');
      ccp._ccpKeyObservable
        .subscribe(() => {
          // eslint-disable-next-line no-console
          expect(console.warn).toHaveBeenCalledWith('CCP key fetch failed; using provided backup key: Internal Server Error');
          done();
        }, () => done.fail('should not have thrown an error'));
    });
    it('should throw an error if no backup key was provided and there was a network error fetching the key from the api', (done) => {
      fetchMock.once(
        stagingKeyUri,
        { throws: new TypeError('Failed to fetch') }
      );
      ccp.init('staging');
      ccp._ccpKeyObservable
        .subscribe(() => done.fail('should not have thrown an error'),
          error => {
            expect(error).toEqual('There was an error retrieving the key from CCP and no backup key was provided: TypeError: Failed to fetch');
            done();
          });
    });
    it('should throw an error if no backup key was provided and there was a server error fetching the key from the api', (done) => {
      fetchMock.once(
        stagingKeyUri,
        500
      );
      ccp.init('staging');
      ccp._ccpKeyObservable
        .subscribe(() => done.fail('should not have thrown an error'),
          error => {
            expect(error).toEqual('There was an error retrieving the key from CCP and no backup key was provided: Internal Server Error');
            done();
          });
    });
    it('should use the key returned by the api', (done) => {
      fetchMock.once(
        stagingKeyUri,
        '<key from api>'
      );
      ccp.init('staging', '<backup key>');
      ccp._ccpKeyObservable
        .subscribe(key => {
          expect(key).toEqual('<key from api>');
          done();
        }, () => done.fail('should not have thrown an error'));
    });
    it('should use the key returned by the production api', (done) => {
      fetchMock.once(
        'https://ccp.ccci.org/api/v1/rest/client-encryption-keys/current',
        '<key from api>'
      );
      ccp.init('production', '<backup key>');
      ccp._ccpKeyObservable
        .subscribe(key => {
          expect(key).toEqual('<key from api>');
          done();
        }, () => done.fail('should not have thrown an error'));
    });
    it('should not fetch the key until the observable is subscribed to', (done) => {
      fetchMock.mock(
        stagingKeyUri,
        validKey
      );
      ccp.init('staging');
      expect(fetchMock.called(stagingKeyUri)).toEqual(false);
      ccp.encrypt('1234567890123456')
        .subscribe(() => {
          expect(fetchMock.called(stagingKeyUri)).toEqual(true);
          done();
        }, () => done.fail('should not have thrown an error'));
    });
  });
  describe('encrypt', () => {
    beforeEach(() => {
      // Setup ccp to use provided backup key
      spyOn(console, 'warn');
      fetchMock.once(
        stagingKeyUri,
        500
      );
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
      ccp.init('staging', validKey);
      ccp.encrypt('1234567890123456')
        .subscribe(value => {
          expect((<string> value).length).toBeGreaterThan(50);
          done();
        }, () => done.fail('should not have thrown an error'));
    });
  });
  describe('key caching and retry', () => {
    it('should retry the key fetch on the next encrypt if a previous fetch failed', (done) => {
      fetchMock.once(
        stagingKeyUri,
        { throws: new TypeError('Failed to fetch') }
      );
      fetchMock.mock(
        stagingKeyUri,
        validKey
      );
      ccp.init('staging');
      ccp.encrypt('1234567890123456')
        .subscribe(() => done.fail('first encrypt should have thrown an error'),
          () => {
            ccp.encrypt('1234567890123456')
              .subscribe(value => {
                expect((<string> value).length).toBeGreaterThan(50);
                expect(fetchMock.calls(stagingKeyUri).length).toEqual(2);
                done();
              }, () => done.fail('second encrypt should not have thrown an error'));
          });
    });
    it('should only fetch the key once if the fetch was successful', (done) => {
      fetchMock.mock(
        stagingKeyUri,
        validKey
      );
      ccp.init('staging');
      ccp.encrypt('1234567890123456')
        .subscribe(() => {
          ccp.encrypt('1234567890123456')
            .subscribe(value => {
              expect((<string> value).length).toBeGreaterThan(50);
              expect(fetchMock.calls(stagingKeyUri).length).toEqual(1);
              done();
            }, () => done.fail('second encrypt should not have thrown an error'));
        }, () => done.fail('first encrypt should not have thrown an error'));
    });
    it('should not cache the backup key and should recover to the fetched key on a later encrypt', (done) => {
      spyOn(console, 'warn');
      fetchMock.once(
        stagingKeyUri,
        500
      );
      fetchMock.mock(
        stagingKeyUri,
        validKey
      );
      ccp.init('staging', validKey);
      ccp.encrypt('1234567890123456')
        .subscribe(() => {
          // eslint-disable-next-line no-console
          expect(console.warn).toHaveBeenCalledWith('CCP key fetch failed; using provided backup key: Internal Server Error');
          ccp.encrypt('1234567890123456')
            .subscribe(value => {
              expect((<string> value).length).toBeGreaterThan(50);
              expect(fetchMock.calls(stagingKeyUri).length).toEqual(2);
              done();
            }, () => done.fail('second encrypt should not have thrown an error'));
        }, () => done.fail('first encrypt should not have thrown an error'));
    });
  });
});
