import { cleanInput } from '../../utils/parsing';
import { cardTypeConsts } from '../card-number/utils/card-types';

export function validateMinLength(input: string | number) {
  const cvv = cleanInput(input);
  return cvv.length >= 3;
}

export function validateMaxLength(input: string | number) {
  const cvv = cleanInput(input);
  return cvv.length <= 4;
}

export function validateCardTypeLength(
  input: string | number,
  cardType?: string,
) {
  if (!cardType) {
    return true;
  }
  const cvv = cleanInput(input);
  const validLengths = cardTypeConsts.filter(
    cardTypeConst => cardTypeConst.name === cardType,
  )[0].cvvLengths;
  return validLengths.indexOf(cvv.length) !== -1;
}

export function validateAll(input: string | number, cardType?: string) {
  if (input === null) {
    // allow CVV to be optional if it is null
    return true;
  }
  const cvv = cleanInput(input);
  return (
    !!cvv &&
    validateMinLength(cvv) &&
    validateMaxLength(cvv) &&
    validateCardTypeLength(cvv, cardType)
  );
}

export function errors(input: string | number, cardType?: string) {
  const cvv = cleanInput(input);
  let errors: string[] = [];
  if (!cvv) {
    errors.push('CVV cannot be blank');
  }
  if (!validateMinLength(cvv)) {
    errors.push('CVV must contain at least 3 digits');
  }
  if (!validateMaxLength(cvv)) {
    errors.push('CVV cannot contain more than 4 digits');
  }
  if (!validateCardTypeLength(cvv, cardType)) {
    errors.push('CVV is not valid for this card type');
  }
  return errors;
}
