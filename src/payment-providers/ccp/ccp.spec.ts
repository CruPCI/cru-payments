// @ts-ignore
import fetchMock from 'jest-fetch-mock';

import * as ccp from './ccp';

describe('ccp', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-undef
    jest.spyOn(global, 'fetch').mockImplementation(fetchMock);
  });

  describe('init', () => {
    it("should use the backup key provided if there's a network error while fetching the key", async () => {
      fetchMock.mockRejectOnce(new TypeError('Failed to fetch'));
      ccp.init('staging', '<backup key>');
      await expect(ccp._ccpKeyPromise).resolves.toEqual('<backup key>');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current',
      );
    });
    it('should use the backup key provided if the api returns a non-ok status code while fetching the key', async () => {
      fetchMock.once(null, { status: 500 });
      ccp.init('staging', '<backup key>');
      await expect(ccp._ccpKeyPromise).resolves.toEqual('<backup key>');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current',
      );
    });
    it('should throw an error if no backup key was provided and there was a network error fetching the key from the api', async () => {
      fetchMock.mockRejectOnce(new TypeError('Failed to fetch'));
      ccp.init('staging');
      await expect(ccp._ccpKeyPromise).rejects.toEqual(
        'There was an error retrieving the key from CCP and no backup key was provided: TypeError: Failed to fetch',
      );
      expect(fetchMock).toHaveBeenCalledWith(
        'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current',
      );
    });
    it('should throw an error if no backup key was provided and there was a server error fetching the key from the api', async () => {
      fetchMock.once('some error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
      ccp.init('staging');
      await expect(ccp._ccpKeyPromise).rejects.toEqual(
        'There was an error retrieving the key from CCP and no backup key was provided: Internal Server Error',
      );
      expect(fetchMock).toHaveBeenCalledWith(
        'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current',
      );
    });
    it('should use the key returned by the api', async () => {
      fetchMock.once('<key from api>');
      ccp.init('staging', '<backup key>');
      await expect(ccp._ccpKeyPromise).resolves.toEqual('<key from api>');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current',
      );
    });
    it('should use the key returned by the production api', async () => {
      fetchMock.once('<key from api>');
      ccp.init('production', '<backup key>');
      await expect(ccp._ccpKeyPromise).resolves.toEqual('<key from api>');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://ccp.ccci.org/api/v1/rest/client-encryption-keys/current',
      );
    });
  });
  describe('encrypt', () => {
    beforeEach(() => {
      // Setup ccp to use provided backup key
      fetchMock.once('some error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
    it('should throw an error if init has not been called', async () => {
      ccp._clear();
      await expect(ccp.encrypt('1234567890123456')).rejects.toEqual(
        'init must be called first',
      );
    });
    it('should throw an error if the key is invalid', async () => {
      ccp.init('staging', '<backup key>');
      await expect(ccp.encrypt('1234567890123456')).rejects.toEqual(
        'Error encrypting bank account number',
      );
    });
    it('should return the encrypted account number', async () => {
      const validKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0
FPqri0cb2JZfXJ/DgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/
3j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQAB
-----END PUBLIC KEY-----`;

      ccp.init('staging', validKey);
      const value = await ccp.encrypt('1234567890123456');
      expect(value.length).toBeGreaterThan(50);
    });
  });
});
