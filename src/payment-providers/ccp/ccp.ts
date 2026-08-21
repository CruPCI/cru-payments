import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';
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
let fetchedKey: string;

export function init(env: string, backupKey?: string){
  fetchedKey = null;
  // Defer the key fetch until the first subscription (first encrypt call) so a transient
  // network failure at page load isn't cached for the life of the page.
  ccpKeyObservable = Observable.defer(() => {
    if(fetchedKey){
      return Observable.of(fetchedKey);
    }
    return Observable.from((<any> window).fetch(env === 'production' ? prodKeyUri : stagingKeyUri))
      .mergeMap((response: Response) => {
        if (response.ok) {
          return Observable.from(response.text());
        }else{
          return Observable.throw(response.statusText);
        }
      })
      // Cache the key only on success. A failed fetch is never cached, so the next
      // encrypt call retries the network request.
      .do((key: string) => fetchedKey = key)
      .catch(error => {
        if(backupKey){
          // The backup key is intentionally not cached so a later encrypt call can
          // recover to the live key once the network/API is healthy again.
          // eslint-disable-next-line no-console
          console.warn('CCP key fetch failed; using provided backup key: ' + error);
          return Observable.of(backupKey);
        }else{
          return Observable.throw('There was an error retrieving the key from CCP and no backup key was provided: ' + error);
        }
      });
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
  fetchedKey = null;
}

// For testing
export {
  ccpKeyObservable as _ccpKeyObservable,
  clear as _clear
};
