import {Observable, from, of, throwError} from 'rxjs';
// eslint-disable-next-line no-unused-vars
import {Observer} from 'rxjs';
import {catchError, mergeMap} from 'rxjs/operators';

import {Promise} from 'es6-promise';
if (!(<any> window).Promise) {
  (<any> window).Promise = Promise;
}
import 'whatwg-fetch';

import {JSEncrypt} from 'jsencrypt';

declare let exports : any;

/* eslint-disable no-undef */
export interface TsysData {
  url: string;
  key: string;
  keyId: string;
}
/* eslint-enable no-undef */

const tsepUri = {
  staging: 'https://stagegw.transnox.com/transit-tsep-web/jsView',
  production: 'https://gateway.transit-pass.com/transit-tsep-web/jsView'
};

let env: string, deviceId: string, manifest: string;

export function init(_env: string, _deviceId: string, _manifest: string){
  env = _env;
  deviceId = _deviceId;
  manifest = _manifest;
}

function makeRequest(url: RequestInfo, init: RequestInit, bodyFn: Function, action: string){
  return from((<any> window).fetch(url, init)).pipe(
    catchError((error: Response) => throwError(() => ({ message: `Network error while ${action}`, data: error }))),
    mergeMap((response: Response) => {
      if (response.ok) {
        return from(bodyFn(response));
      }
      return from(response.text()).pipe(
        mergeMap(body => throwError(() => ({ message: `Server error while ${action}`, data: { status: response.status, statusText: response.statusText, body: body } })))
      );
    })
  );
}

function fetchTsysData(){
  const uri: string = env === 'production' ? tsepUri.production : tsepUri.staging;
  return exports._makeRequest(
    `${uri}/${deviceId}?${manifest}`,
    {},
    (request: Request) => request.text(),
    'loading TSYS library'
  )
    .pipe(mergeMap((response: string) => {
      return new Observable((observer: Observer<any>) => {
        // Watch tsepHandler for errors loading the TSYS library
        const tsepHandler = (eventType: string, event: any) => {
          if(eventType === 'ErrorEvent'){
            observer.error({ message: 'TSYS load error', data: event });
            observer.complete();
          }
        };

        try {
          // Execute TSYS code in function. Add return values to get data that is not publicly advertised by TSYS. Call onload to run TSYS error handling if unsuccessful.
          const tsysData: TsysData = new Function('tsepHandler', `${removeAppendChild(response)}
          try{
            return { url: getUrl(), key: getKey(), keyId: getKeyId() };
          } catch(e){}
          try{
            window.onload();
          } catch(e){}
          return null;
          `)(tsepHandler);
          if(!tsysData) {
            observer.error({ message: 'TSYS load error', data: 'TSYS did not provide a getUrl, getKey, and/or getKeyId function' });
          }else{
            observer.next(tsysData);
          }
        } catch(e){
          observer.error({ message: 'Error parsing TSYS code', data: e });
        }
        observer.complete();
      });
    }));
}

function removeAppendChild(code: string){
  return code.replace(/[^;]*appendChild.*?;/g, ''); // Prevent script imports from being added to the DOM
}

export function encrypt(cardNumber: string, cvv: string, month: number, year: number): Observable<any> {
  if(!deviceId){
    return throwError(() => ({ message: 'Device ID not set', data: 'init needs to be called first' }));
  }
  if(!manifest){
    return throwError(() => ({ message: 'Manifest not set', data: 'init needs to be called first' }));
  }

  return exports._fetchTsysData()
    .pipe(mergeMap((tsysData: TsysData) => {
      let monthString = String(month);
      monthString = monthString.length === 1 ? '0' + monthString : monthString;
      const expiryDate = monthString + '/' + String(year);

      // Encryption method not publicly advertised by TSYS. Extracted from tsep.js.
      const encryptor = new JSEncrypt();
      encryptor.setKey(tsysData.key);
      const encryptedNumber = encryptor.encrypt(cardNumber);
      if (encryptedNumber === false) {
        return throwError(() => ({ message: 'Encryption error', data: 'Could not encrypt the card number with the key provided by TSYS' }));
      }

      // Request format not publicly advertised by TSYS. /generateTsepToken url fragment, method, and request body format extracted from tsep.js.
      return exports._makeRequest(
        tsysData.url + '/generateTsepToken',
        {
          method: 'POST',
          body: JSON.stringify({
            deviceID: deviceId,
            uniqueKeyIdentifier: tsysData.keyId,
            manifest: manifest,
            encCardNumber: encryptedNumber,
            expirationDate: expiryDate,
            cvv2: cvv
          }),
          headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          })
        },
        (request: Request) => request.json(),
        'performing tokenization'
      );
    }),
    mergeMap((response: any) => {
      if(response.status === 'PASS'){
        return of(response);
      }
      return throwError(() => ({ message: 'Tokenization error', data: response }));
    }));
}

// For testing
export {
  env as _env,
  deviceId as _deviceId,
  manifest as _manifest,
  makeRequest as _makeRequest,
  fetchTsysData as _fetchTsysData,
  removeAppendChild as _removeAppendChild
};
