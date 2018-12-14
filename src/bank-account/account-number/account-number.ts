import { cleanInput } from '../../utils/parsing';

export function validateMinLength(input: string | number) {
  const accountNumber: string = cleanInput(input);
  return accountNumber.length >= 2;
}

export function validateMaxLength(input: string | number) {
  const accountNumber: string = cleanInput(input);
  return accountNumber.length <= 17;
}

export function validateAll(input: string | number) {
  const accountNumber = cleanInput(input);
  return (
    !!accountNumber &&
    validateMinLength(accountNumber) &&
    validateMaxLength(accountNumber)
  );
}

export function errors(input: string | number) {
  const accountNumber = cleanInput(input);
  let errors: string[] = [];
  if (!accountNumber) {
    errors.push('Account number cannot be blank');
  }
  if (!validateMinLength(accountNumber)) {
    errors.push('Account number must contain at least 2 digits');
  }
  if (!validateMaxLength(accountNumber)) {
    errors.push('Account number cannot contain more than 17 digits');
  }
  return errors;
}
