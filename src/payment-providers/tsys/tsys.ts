import { JSEncrypt } from 'jsencrypt';

declare let exports: {
  _env: typeof env;
  _deviceId: typeof deviceId;
  _manifest: typeof manifest;
  _makeRequest: typeof makeRequest;
  _fetchTsysData: typeof fetchTsysData;
  _removeAppendChild: typeof removeAppendChild;
};

/* eslint-disable no-undef */
export interface TsysData {
  url: string;
  key: string;
  keyId: string;
}
/* eslint-enable no-undef */

const tsepUri = {
  staging: 'https://stagegw.transnox.com/transit-tsep-web/jsView',
  production: 'https://gateway.transit-pass.com/transit-tsep-web/jsView',
};

let env: string, deviceId: string, manifest: string;

export function init(_env: string, _deviceId: string, _manifest: string) {
  env = _env;
  deviceId = _deviceId;
  manifest = _manifest;
}

async function makeRequest(
  url: RequestInfo,
  init: RequestInit,
  bodyFn: Function,
  action: string,
) {
  let response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    throw {
      message: `Network error while ${action}`,
      data: error,
    };
  }

  if (response.ok) {
    return bodyFn(response);
  }

  const body = await response.text();
  throw {
    message: `Server error while ${action}`,
    data: {
      status: response.status,
      statusText: response.statusText,
      body: body,
    },
  };
}

async function fetchTsysData(): Promise<TsysData> {
  const uri: string =
    env === 'production' ? tsepUri.production : tsepUri.staging;
  const response = await exports._makeRequest(
    `${uri}/${deviceId}?${manifest}`,
    {},
    (request: Request) => request.text(),
    'loading TSYS library',
  );
  return new Promise((resolve, reject) => {
    // Watch tsepHandler for errors loading the TSYS library
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tsepHandler = (eventType: string, event: any) => {
      if (eventType === 'ErrorEvent') {
        reject({ message: 'TSYS load error', data: event });
      }
    };

    try {
      // Execute TSYS code in function. Add return values to get data that is not publicly advertised by TSYS. Call onload to run TSYS error handling if unsuccessful.
      const tsysData: TsysData = new Function(
        'tsepHandler',
        `${removeAppendChild(response)}
          try{
            return { url: getUrl(), key: getKey(), keyId: getKeyId() };
          } catch(e){}
          try{
            window.onload();
          } catch(e){}
          return null;
          `,
      )(tsepHandler);
      if (!tsysData) {
        reject({
          message: 'TSYS load error',
          data:
            'TSYS did not provide a getUrl, getKey, and/or getKeyId function',
        });
      } else {
        resolve(tsysData);
      }
    } catch (e) {
      reject({ message: 'Error parsing TSYS code', data: e });
    }
  });
}

function removeAppendChild(code: string) {
  return code.replace(/[^;]*appendChild.*?;/g, ''); // Prevent script imports from being added to the DOM
}

export async function encrypt(
  cardNumber: string,
  cvv: string,
  month: number,
  year: number,
) {
  if (!deviceId) {
    throw {
      message: 'Device ID not set',
      data: 'init needs to be called first',
    };
  }
  if (!manifest) {
    throw {
      message: 'Manifest not set',
      data: 'init needs to be called first',
    };
  }

  const tsysData = await exports._fetchTsysData();

  let monthString = String(month);
  monthString = monthString.length === 1 ? '0' + monthString : monthString;
  const expiryDate = monthString + '/' + String(year);

  // Encryption method not publicly advertised by TSYS. Extracted from tsep.js.
  const encryptor = new JSEncrypt();
  encryptor.setKey(tsysData.key);
  const encryptedNumber = encryptor.encrypt(cardNumber);
  if (encryptedNumber === false) {
    throw {
      message: 'Encryption error',
      data: 'Could not encrypt the card number with the key provided by TSYS',
    };
  }

  // Request format not publicly advertised by TSYS. /generateTsepToken url fragment, method, and request body format extracted from tsep.js.
  const response = await exports._makeRequest(
    tsysData.url + '/generateTsepToken',
    {
      method: 'POST',
      body: JSON.stringify({
        deviceID: deviceId,
        uniqueKeyIdentifier: tsysData.keyId,
        manifest: manifest,
        encCardNumber: encryptedNumber,
        expirationDate: expiryDate,
        cvv2: cvv,
      }),
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    },
    (request: Request) => request.json(),
    'performing tokenization',
  );
  if (response.status === 'PASS') {
    return response;
  }
  throw {
    message: 'Tokenization error',
    data: response,
  };
}

// For testing
export {
  env as _env,
  deviceId as _deviceId,
  manifest as _manifest,
  makeRequest as _makeRequest,
  fetchTsysData as _fetchTsysData,
  removeAppendChild as _removeAppendChild,
};
