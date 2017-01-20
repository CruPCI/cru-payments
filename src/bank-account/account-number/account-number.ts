import * as _ from 'lodash';

import {cleanInput} from '../../utils/parsing';

export function validateMinLength(input: string|number){
  const accountNumber: string = cleanInput(input);
  return accountNumber.length >= 2;
}

export function validateMaxLength(input: string|number){
  const accountNumber: string = cleanInput(input);
  return accountNumber.length <= 17;
}

export function validateAll(input: string|number){
  const accountNumber = cleanInput(input);
  return !_.isEmpty(accountNumber) &&
    validateMinLength(accountNumber) &&
    validateMaxLength(accountNumber);
}
