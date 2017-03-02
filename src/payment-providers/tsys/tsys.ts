import {Observable} from 'rxjs/Observable';
// eslint-disable-next-line no-unused-vars
import {Observer} from 'rxjs/Observer';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

declare let exports : any;

/* eslint-disable no-undef */
interface InputInfo {
  id: string;
  name: string;
  element?: HTMLElement;
}
/* eslint-enable no-undef */

const inputs: InputInfo[] = [
  {
    id: 'tsep-cardNumDiv',
    name: 'cardNumber'
  },
  {
    id: 'tsep-datepickerDiv',
    name: 'expiryDate'
  },
  {
    id: 'tsep-cvv2Div',
    name: 'cvv'
  }];

const tsepUri = {
  staging: 'https://stagegw.transnox.com/transit-tsep-web/jsView',
  production: 'https://gateway.transit-pass.com/transit-tsep-web/jsView'
};

let inputsObservable: Observable<any>;
let previousEncryptObservable: Observable<any> = Observable.of('initial');

let env: string, deviceId: string, manifest: string;

setupInputs(); // Add divs and setup watch for inputs on script load

export function init(_env: string, _deviceId: string, _manifest: string){
  env = _env;
  deviceId = _deviceId;
  manifest = _manifest;
}

function setupInputs(){
  // creates Observable that will emit an array of inputs to be used for TSYS encryption
  inputsObservable = Observable.of(inputs)
    .mergeMap(inputs => {
      return inputs.map(input => {
        // Add hidden divs to the page for TSYS to fill with their inputs
        const div = addDiv(input.id);

        return new Observable((observer: Observer<any>) => {
          // Watch tsepHandler for errors loading the TSYS library
          (<any> window).tsepHandler = (eventType: string, event: any) => {
            if(eventType === 'ErrorEvent'){
              observer.error(event);
              observer.complete();
            }
          };

          // Watch our divs and add the input element to our input object when the inputs are ready
          const mutationObserver = new MutationObserver(mutations => {
            input.element = <HTMLElement> mutations[0].addedNodes[0];
            observer.next(input);
            observer.complete();
            mutationObserver.disconnect();
          });
          mutationObserver.observe(div, { childList: true });
        });
      });
    })
    .mergeAll()
    .toArray()
    .map((inputs: InputInfo[]) => {
      let output: { [key:string]:HTMLElement; } = {};
      inputs.forEach(input => {
        output[input.name] = input.element;
      });
      return output;
    })
    // Publish the replay so subscriptions share the same value and don't reinitialize the Observable
    .publishReplay().refCount();
}

function importVendorCode(){
  // Return Observable that completes when the code has been loaded
  return new Observable((observer: Observer<any>) => {
    const fileRef: HTMLScriptElement = document.createElement("script");
    fileRef.setAttribute("type", "text/javascript");
    const uri: string = env === 'production' ? tsepUri.production : tsepUri.staging;
    fileRef.setAttribute("src", `${uri}/${deviceId}?${manifest}`);
    fileRef.onload = () => {
      observer.next('new key loaded');
      observer.complete();
    };
    document.body.appendChild(fileRef);
  });
}

function addDiv(id: string){
  const div: HTMLElement = document.createElement('div');
  div.setAttribute('id', id);
  div.style.display = 'none';
  document.body.appendChild(div);
  return div;
}

export function encrypt(cardNumber: string, cvv: string, month: number, year: number){
  // Map from previous observable to wait for the previous encryption to emit a value
  return previousEncryptObservable = previousEncryptObservable
    .catch(() => Observable.of('single item')) // convert errors to next emissions so the next observable waits correctly
    .mergeMap(() => {
      return exports._importVendorCode(); // Re-import vendor code to retrieve a new public key from TSYS. Use reference on exports obj so it can be mocked
    })
    .mergeMap(() => inputsObservable) // After waiting for previous observables to complete we get the TSYS inputs to fill with card details
    .mergeMap(inputs => {
      let monthString = String(month);
      monthString = monthString.length === 1 ? '0' + monthString : monthString;

      // Fill TSYS inputs with the values to be encrypted
      inputs.cardNumber.value = cardNumber;
      inputs.cvv.value = cvv;
      inputs.expiryDate.value = monthString + '/' + String(year);

      // Emit response from TSYS tokenization
      return new Observable<any>((observer: Observer<any>) => {
        (<any> window).tsepHandler = (eventType: string, event: any) => {
          switch(eventType){
            case 'FieldValidationErrorEvent':
              observer.error(event);
              observer.complete();
              break;
            case 'TokenEvent':
              if(event && event.status === 'PASS'){
                observer.next(event);
              }else{
                observer.error(event);
              }
              observer.complete();
              break;
            case 'ErrorEvent':
              observer.error(event);
              observer.complete();
              break;
          }
        };

        // Trigger focusout event so that the TSYS library will attempt encrypting and tokenizing the credit card
        if((<any> window).jqtsep) {
          (<any> window).jqtsep(inputs.cardNumber).trigger('focusout');
        }else {
          (<any> window).$(inputs.cardNumber).trigger('focusout');
        }
      });
    })
    // Publish the replay so subscriptions share the same value and don't reinitialize the Observable
    .publishReplay().refCount();
}

// For testing
export {
  inputsObservable as _inputsObservable,
  importVendorCode as _importVendorCode,
  setupInputs as _setupInputs
};
