import * as _ from 'lodash';
import {cleanInput} from '../../utils/parsing';

export function validateLength(input: string|number = ''){
  const routingNumber: string = cleanInput(input);
  return routingNumber.length === 9;
}

export function validateChecksum(input: string|number = ''){
    const routingNumber: string = cleanInput(input);
    const digits = routingNumber.split('');
    if(Number(digits[0]) > 3) return false; // Added to match EP validation https://github.com/CruGlobal/give-ep-extensions/blob/develop/cortex/resources/bank-account-resource/src/main/java/com/elasticpath/extensions/rest/resource/bankaccounts/validator/BankAccountValidator.java#L57
    const multipliers = [3, 7, 1, 3, 7, 1, 3, 7, 1];

    const checksum = _(digits)
      .zip(multipliers)
      .map((array: [number, number]) => {
        return array[0] * array[1];
      })
      .sum();
    return checksum !== 0 && checksum % 10 === 0;
}

export function validateAll(input: string|number){
  const accountNumber = cleanInput(input);
  return !_.isEmpty(accountNumber) &&
    validateLength(accountNumber) &&
    validateChecksum(accountNumber);
}
