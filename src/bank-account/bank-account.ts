import { cleanInput } from '../utils/parsing';

import * as routingNumberModule from './routing-number/routing-number';
import * as accountNumberModule from './account-number/account-number';
import { encrypt as bankAccountEncrypt } from '../payment-providers/ccp/ccp';

export { init } from '../payment-providers/ccp/ccp';

export const routingNumber = {
  validate: {
    length: routingNumberModule.validateLength,
    checksum: routingNumberModule.validateChecksum,
    all: routingNumberModule.validateAll,
  },
  errors: routingNumberModule.errors,
};

export const accountNumber = {
  validate: {
    minLength: accountNumberModule.validateMinLength,
    maxLength: accountNumberModule.validateMaxLength,
    all: accountNumberModule.validateAll,
  },
  errors: accountNumberModule.errors,
};

export function validate(
  routingNumberInput: string | number,
  accountNumberInput: string | number,
) {
  return (
    routingNumber.validate.all(routingNumberInput) &&
    accountNumber.validate.all(accountNumberInput)
  );
}

export async function encrypt(accountNumberInput: string | number) {
  if (!accountNumber.validate.all(accountNumberInput)) {
    throw 'Bank account number invalid';
  }
  return await bankAccountEncrypt(cleanInput(accountNumberInput));
}
