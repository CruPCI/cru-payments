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
  const routingNumber = cleanInput(input);
  return !!routingNumber &&
    validateLength(routingNumber) &&
    validateChecksum(routingNumber);
}

export function errors(input: string|number){
  const routingNumber = cleanInput(input);
  let errors: string[] = [];
  if(!routingNumber){
    errors.push('Routing number cannot be blank');
  }
  if(!validateLength(routingNumber)){
    errors.push('Routing number must contain 9 digits');
  }
  if(!validateChecksum(routingNumber)){
    errors.push('Routing number is invalid. At least one digit was entered incorrectly.');
  }
  return errors;
}
