import {Observable, from, of, throwError} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';

import {Promise} from 'es6-promise';
if (!(<any> window).Promise) {
  (<any> window).Promise = Promise;
}
import 'whatwg-fetch';

import {JSEncrypt} from 'jsencrypt';

const prodKeyUri = 'https://ccp.ccci.org/api/v1/rest/client-encryption-keys/current';
const stagingKeyUri = 'https://ccpstaging.ccci.org/api/v1/rest/client-encryption-keys/current';

let ccpKeyObservable: Observable<string>;

export function init(env: string, backupKey?: string){
  ccpKeyObservable = from((<any> window).fetch(env === 'production' ? prodKeyUri : stagingKeyUri)).pipe(
    mergeMap((response: Response) => {
      if (response.ok) {
        return from(response.text());
      }else{
        return throwError(() => response.statusText);
      }
    }),
    catchError(error => {
      if(backupKey){
        return of(backupKey);
      }else{
        return throwError(() => 'There was an error retrieving the key from CCP and no backup key was provided: ' + error);
      }
    })
  );
}

export function encrypt(accountNumber: string){
  if(!ccpKeyObservable){
    return throwError(() => 'init must be called first');
  }

  return ccpKeyObservable.pipe(
    map(key => {
      const encryptor = new JSEncrypt();
      encryptor.setKey(key);
      return encryptor.encrypt(accountNumber);
    }),
    mergeMap(encryptedNumber => {
      if (encryptedNumber !== false) {
        return of(encryptedNumber);
      }else{
        return throwError(() => 'Error encrypting bank account number');
      }
    })
  );
}

function clear(){
  ccpKeyObservable = null;
}

// For testing
export {
  ccpKeyObservable as _ccpKeyObservable,
  clear as _clear
};
