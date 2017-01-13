import * as _ from 'lodash';
import {cleanInput} from '../../utils/parsing';
import {validateCardType, getCardTypeError, getCardTypeName} from './utils/card-types';
import {luhnCheck} from './utils/luhn-check';

export function validateMinLength(input: string|number){
  const cardNumber = cleanInput(input);
  return cardNumber.length >= 13;
}

export function validateMaxLength(input: string|number){
  const cardNumber = cleanInput(input);
  return cardNumber.length <= 16;
}

export function validateType(input: string|number) {
  const cardNumber = cleanInput(input);
  return validateCardType(cardNumber);
}

export function validateNumber(input: string|number){
  const cardNumber = cleanInput(input);
  return luhnCheck(cardNumber);
}

export function validateAll(input: string|number){
  const cardNumber = cleanInput(input);
  return !_.isEmpty(cardNumber) &&
    validateMinLength(cardNumber) &&
    validateMaxLength(cardNumber) &&
    validateType(cardNumber) &&
    validateNumber(cardNumber);
}

export function errors(input: string|number){
  const cardNumber = cleanInput(input);
  let errors = [];
  if(!validateMinLength(cardNumber)){
    errors.push('Card number contain at least 13 digits');
  }
  if(!validateMaxLength(cardNumber)){
    errors.push('Card number contain at most 16 digits');
  }
  if(!validateType(cardNumber)){
    errors.push(getCardTypeError(cardNumber));
  }
  if(!validateNumber(cardNumber)){
    errors.push('Card number is invalid. At least one digit was entered incorrectly.');
  }
  return errors;
}

export function getCardType(input: string|number){
  const cardNumber = cleanInput(input);
  return getCardTypeName(cardNumber);
}
