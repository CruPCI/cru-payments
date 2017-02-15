import {cleanInput} from '../../utils/parsing';
import {cardTypeConsts} from '../card-number/utils/card-types';

export function validateMinLength(input: string|number){
  const cvv = cleanInput(input);
  return cvv.length >= 3;
}

export function validateMaxLength(input: string|number){
  const cvv = cleanInput(input);
  return cvv.length <= 4;
}

export function validateCardTypeLength(input: string|number, cardType?: string){
  if(!cardType){
    return true;
  }
  const cvv = cleanInput(input);
  const validLengths = cardTypeConsts.filter(cardTypeConst => cardTypeConst.name === cardType)[0].cvvLengths;
  return validLengths.indexOf(cvv.length) !== -1;
}

export function validateAll(input: string|number, cardType?: string){
  const cvv = cleanInput(input);
  return !!cvv &&
    validateMinLength(cvv) &&
    validateMaxLength(cvv) &&
    validateCardTypeLength(cvv, cardType);
}
