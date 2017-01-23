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

export function init(env: string, deviceId: string, manifest: string){
  // Return Observable that will emit an array of inputs to be used for TSYS encryption
  inputsObservable = Observable.of(inputs)
    .mergeMap(inputs => {
      // Since the TSYS library only lets us use the public key once, we need to delete the old divs and inputs in preparation for reloading the TSYS library
      removeOldDivs();

      const initializedInputs = inputs.map(input => {
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

      importVendorCode(env, deviceId, manifest);

      return initializedInputs;
    })
    .mergeAll()
    .toArray()
    .map((inputs: InputInfo[]) => {
      let output: { [key:string]:HTMLElement; } = {};
      inputs.forEach(input => {
        output[input.name] = input.element;
      });
      return output;
    });
}

function importVendorCode(env: string, deviceId: string, manifest: string){
  const fileRef: HTMLScriptElement = document.createElement("script");
  fileRef.setAttribute("type", "text/javascript");
  const uri: string = env === 'production' ? tsepUri.production : tsepUri.staging;
  fileRef.setAttribute("src", `${uri}/${deviceId}?${manifest}`);
  fileRef.onload = () => dispatchEvent(new Event('load')); // Make TSYS's error handling run when the page has already loaded
  document.body.appendChild(fileRef);
}

function addDiv(id: string){
  const div: HTMLElement = document.createElement('div');
  div.setAttribute('id', id);
  div.style.display = 'none';
  document.body.appendChild(div);
  return div;
}

function removeOldDivs(){
  for(let input of inputs){
    const div: HTMLElement = document.getElementById(input.id);
    if(div){
      div.remove();
    }
  }
}

export function encrypt(cardNumber: string, cvv: string, month: number, year: number){
  // Map from previous observable to wait for the previous encryption to emit a value
  return previousEncryptObservable = previousEncryptObservable
    .catch(() => Observable.of('single item')) // convert errors to next emissions so the next observable waits correctly
    // adding inputsObservable to the stream will reproduce it's value and reload the TSYS library to get a new public key
    .mergeMap(() => inputsObservable)
    .mergeMap(inputs => {
      let monthString = String(month);
      monthString = monthString.length === 1 ? '0' + monthString : monthString;

      // Fill TSYS inputs with the values to be encrypted
      inputs.cardNumber.value = cardNumber;
      inputs.cvv.value = cvv;
      inputs.expiryDate.value = monthString + '/' + String(year);

      // Emit response from TSYS encryption
      return new Observable<any>((observer: Observer<any>) => {
        (<any> window).tsepHandler = (eventType: string, event: any) => {
          switch(eventType){
            case 'FieldValidationErrorEvent':
              observer.error(event);
              observer.complete();
              break;
            case 'TokenEvent':
              observer.next(event);
              observer.complete();
              break;
            case 'ErrorEvent':
              observer.error(event);
              observer.complete();
              break;
          }
        };

        // Trigger focusout event so that the TSYS library will attempt encrypting and tokenizing the credit card
        (<any> window).jqtsep(inputs.cardNumber).trigger('focusout');
      });
    })
    // Publish the replay so subscriptions share the same value and don't reinitialize the Observable
    .publishReplay().refCount();
}

// For testing
export {
  inputsObservable as _inputsObservable
};
