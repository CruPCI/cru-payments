import * as _ from 'lodash';
import {cleanInput} from '../../utils/parsing';

export function validateMinLength(input: string|number){
  const cvv = cleanInput(input);
  return cvv.length >= 3;
}

export function validateMaxLength(input: string|number){
  const cvv = cleanInput(input);
  return cvv.length <= 4;
}

export function validateAll(input: string|number){
  const cvv = cleanInput(input);
  return !_.isEmpty(cvv) &&
    validateMinLength(cvv) &&
    validateMaxLength(cvv);
}
