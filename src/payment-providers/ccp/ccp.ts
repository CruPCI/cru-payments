import { JSEncrypt } from 'jsencrypt';

const prodKeyUri =
  'https://ccp.ccci.org/api/v1/rest/client-encryption-keys/current';
const stagingKeyUri =
  'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current';

let ccpKeyPromise: Promise<string>;

export async function init(env: string, backupKey?: string) {
  let response;

  try {
    response = await fetch(env === 'production' ? prodKeyUri : stagingKeyUri);
  } catch (error) {
    if (backupKey) {
      return backupKey;
    } else {
      throw `There was an error retrieving the key from CCP and no backup key was provided: ${error}`;
    }
  }

  if (response.ok) {
    return await (ccpKeyPromise = response.text());
  } else {
    throw response.statusText;
  }
}

export async function encrypt(accountNumber: string) {
  if (!ccpKeyPromise) {
    throw 'init must be called first';
  }

  const key = await ccpKeyPromise;

  const encryptor = new JSEncrypt();
  encryptor.setKey(key);
  const encryptedNumber = encryptor.encrypt(accountNumber);

  if (encryptedNumber !== false) {
    return encryptedNumber;
  } else {
    throw 'Error encrypting bank account number';
  }
}

function clear() {
  ccpKeyPromise = null;
}

// For testing
export { ccpKeyPromise as _ccpKeyObservable, clear as _clear };
