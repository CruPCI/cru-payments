import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import {cleanInput} from '../utils/parsing';
import * as cardNumberModule from './card-number/card-number';
import {validateMinLength as cvvValidateMinLength, validateMaxLength as cvvValidateMaxLength, validateAll as cvvValidateAll} from './cvv/cvv';
import {validateExpiryDate} from './expiry-date/expiry-date';
import {encrypt as tsysEncrypt} from '../payment-providers/tsys/tsys';

export {init} from '../payment-providers/tsys/tsys';

export const card = {
  validate: {
    minLength: cardNumberModule.validateMinLength,
    maxLength: cardNumberModule.validateMaxLength,
    knownType: cardNumberModule.validateKnownType,
    typeLength: cardNumberModule.validateTypeLength,
    checksum: cardNumberModule.validateChecksum,
    all: cardNumberModule.validateAll
  },
  errors:cardNumberModule.errors,
  info: {
    type: cardNumberModule.getCardType,
    expectedLengthForType: cardNumberModule.expectedLengthForType
  }
};

export const cvv = {
  validate: {
    minLength: cvvValidateMinLength,
    maxLength: cvvValidateMaxLength,
    all: cvvValidateAll
  }
};

export const expiryDate = {
  validate: validateExpiryDate
};

export function validate(cardNumber: string|number, cvv: string|number, month: number, year: number){
  return cardNumberModule.validateAll(cardNumber) &&
    cvvValidateAll(cvv) &&
    validateExpiryDate(month, year);
}

export function encrypt(cardNumber: string|number, cvv: string|number, month: number, year: number){
  if(!validate(cardNumber, cvv, month, year)){
    return Observable.throw('Credit card details invalid');
  }
  return tsysEncrypt(cleanInput(cardNumber), cleanInput(cvv), month, year);
}
