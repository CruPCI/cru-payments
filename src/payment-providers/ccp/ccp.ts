import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';

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
  ccpKeyObservable = Observable.from((<any> window).fetch(env === 'production' ? prodKeyUri : stagingKeyUri))
    .mergeMap((response: Response) => {
      if (response.ok) {
        return Observable.of(response.text());
      }else{
        return Observable.throw(response.statusText);
      }
    })
    .catch(error => {
      if(backupKey){
        return Observable.of(backupKey);
      }else{
        return Observable.throw('There was an error retrieving the key from CCP and no backup key was provided: ' + error);
      }
    });
}

export function encrypt(accountNumber: string){
  if(!ccpKeyObservable){
    return Observable.throw('init must be called first');
  }

  return ccpKeyObservable
    .map(key => {
      const encryptor = new JSEncrypt();
      encryptor.setKey(key);
      return encryptor.encrypt(accountNumber);
    })
    .mergeMap(encryptedNumber => {
      if (encryptedNumber !== false) {
        return Observable.of(encryptedNumber);
      }else{
        return Observable.throw('Error encrypting bank account number');
      }
    });
}

function clear(){
  ccpKeyObservable = null;
}

// For testing
export {
  ccpKeyObservable as _ccpKeyObservable,
  clear as _clear
};
