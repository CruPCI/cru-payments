import {cleanInput} from '../../utils/parsing';
import * as cardTypes from './utils/card-types';
import {luhnCheck} from './utils/luhn-check';

export function validateMinLength(input: string|number){
  const cardNumber = cleanInput(input);
  return cardNumber.length >= 13;
}

export function validateMaxLength(input: string|number){
  const cardNumber = cleanInput(input);
  return cardNumber.length <= 16;
}

export function validateKnownType(input: string|number) {
  const cardNumber = cleanInput(input);
  return cardTypes.validateKnownType(cardNumber);
}

export function validateTypeLength(input: string|number) {
  const cardNumber = cleanInput(input);
  return cardTypes.validateTypeLength(cardNumber);
}

export function validateChecksum(input: string|number){
  const cardNumber = cleanInput(input);
  return luhnCheck(cardNumber);
}

export function validateAll(input: string|number){
  const cardNumber = cleanInput(input);
  return !!cardNumber &&
    validateMinLength(cardNumber) &&
    validateMaxLength(cardNumber) &&
    validateKnownType(cardNumber) &&
    validateTypeLength(cardNumber) &&
    validateChecksum(cardNumber);
}

export function errors(input: string|number){
  const cardNumber = cleanInput(input);
  let errors: string[] = [];
  if(!cardNumber){
    errors.push('Card number cannot be blank');
  }
  if(!validateMinLength(cardNumber)){
    errors.push('Card number must contain at least 13 digits');
  }
  if(!validateMaxLength(cardNumber)){
    errors.push('Card number cannot contain more than 16 digits');
  }
  if(!validateKnownType(cardNumber)){
    errors.push('Card type is not accepted by this system');
  }
  if(validateKnownType(cardNumber) && !validateTypeLength(cardNumber)){
    errors.push(`This is an invalid ${cardTypes.getCardTypeName(cardNumber)} number. It should have ${cardTypes.expectedLength(cardNumber).join(' or ')} digits but the number entered has ${cardNumber.length}.`);
  }
  if(!validateChecksum(cardNumber)){
    errors.push('Card number is invalid. At least one digit was entered incorrectly.');
  }
  return errors;
}

export function getCardType(input: string|number){
  const cardNumber = cleanInput(input);
  return cardTypes.getCardTypeName(cardNumber);
}

export {expectedLength as expectedLengthForType} from './utils/card-types';
