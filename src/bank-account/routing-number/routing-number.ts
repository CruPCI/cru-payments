import {cleanInput} from '../../utils/parsing';

export function validateLength(input: string|number = ''){
  const routingNumber: string = cleanInput(input);
  return routingNumber.length === 9;
}

export function validateChecksum(input: string|number = ''){
  if(!validateLength(input)){
    return false;
  }
  const routingNumber: string = cleanInput(input);
  const digits = routingNumber.split('').map(digit => Number(digit));
  if(digits[0] > 3) return false; // Added to match EP validation https://github.com/CruGlobal/give-ep-extensions/blob/develop/cortex/resources/bank-account-resource/src/main/java/com/elasticpath/extensions/rest/resource/bankaccounts/validator/BankAccountValidator.java#L57
  const multipliers = [3, 7, 1, 3, 7, 1, 3, 7, 1];

  const checksum = digits.reduce((acc, digit, index) => {
    return acc + digit * multipliers[index];
  }, 0);

  return checksum !== 0 && checksum % 10 === 0;
}

export function validateAll(input: string|number){
  const accountNumber = cleanInput(input);
  return !!accountNumber &&
    validateLength(accountNumber) &&
    validateChecksum(accountNumber);
}
