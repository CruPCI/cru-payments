import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import {cleanInput} from '../utils/parsing';
import * as cardNumberModule from './card-number/card-number';
import {validateMinLength as cvvValidateMinLength, validateMaxLength as cvvValidateMaxLength, validateCardTypeLength as cvvValidateCardTypeLength, validateAll as cvvValidateAll, errors as cvvErrors} from './cvv/cvv';
import {validateMonth, validateYear, errors as expiryDateErrors} from './expiry-date/expiry-date';
import {encrypt as creditCardEncrypt} from '../payment-providers/tsys/tsys';

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
  errors: cardNumberModule.errors,
  info: {
    type: cardNumberModule.getCardType,
    expectedLengthForType: cardNumberModule.expectedLengthForType
  }
};

export const cvv = {
  validate: {
    minLength: cvvValidateMinLength,
    maxLength: cvvValidateMaxLength,
    cardTypeLength: cvvValidateCardTypeLength,
    all: cvvValidateAll
  },
  errors: cvvErrors
};

export const expiryDate = {
  validate: {
    month: validateMonth,
    year: validateYear,
    all: validateMonth
  },
  errors: expiryDateErrors
};

export function validate(cardNumber: string|number, cvvInput: string|number, month: string|number, year: string|number){
  return card.validate.all(cardNumber) &&
    cvv.validate.all(cvvInput, card.info.type(cardNumber)) &&
    expiryDate.validate.all(month, year);
}

export function encrypt(cardNumber: string|number, cvv: string|number, month: string|number, year: string|number){
  if(!validate(cardNumber, cvv, month, year)){
    return Observable.throw('Credit card details invalid');
  }
  // allow CVV to be optional if it is null
  return creditCardEncrypt(cleanInput(cardNumber), cvv === null ? null : cleanInput(cvv), Number(cleanInput(month)), Number(cleanInput(year)));
}
