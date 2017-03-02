# Cru Payments
[![Build Status](https://travis-ci.org/CruPCI/cru-payments.svg?branch=master)](https://travis-ci.org/CruPCI/cru-payments)
[![codecov](https://codecov.io/gh/CruPCI/cru-payments/branch/master/graph/badge.svg)](https://codecov.io/gh/CruPCI/cru-payments)

## Importing

### Import package
Import using `yarn add cru-payments` or `npm install cru-payments --save`

Note: If you only need to accept one type of payment, use one of the specific builds:
- Use `dist/cru-payments.js` for credit cards and bank accounts
- Use `dist/cru-payments-ba.js` for bank accounts only
- Use `dist/cru-payments-cc.js` for credit cards only

#### Use without a module loader
1. Add `node_modules/cru-payments/dist/cru-payments.js` to a script tag in your app. You may have to move the file somewhere else for it to be publicly accessible.
2. Use the global variable `cruPayments`

#### Use with a module loader
1. `import cruPayments from 'cru-payments/dist/cru-payments';`

#### Use with Internet Explorer
IE 10 requires the [MutationObserver polyfill](https://github.com/megawac/MutationObserver.js) to be included before cru-payments (Required for credit card payments only)
Credit card payments do not work in IE 9 or below
Bank account payments do not work in IE 8 or below

### Build and use locally
1. `yarn` or `npm install`
2. `yarn run build` or `npm run build`
3. Use `dist/cru-payments.js` in your app

## API Usage

### Credit Card

Note: Use `cruPayments` instead of `cruPayments.creditCard` if using `cru-payments-cc.js`

#### `cruPayments.creditCard.init(environment, deviceId, manifest)`
Must be called at least once before calling `cruPayments.creditCard.encrypt`. If environment is `'production'`, it will grab the code from TSYS's production servers, otherwise it will use TSYS's staging servers.

#### `cruPayments.creditCard.validate(cardNumber, cvv, month, year)`
Returns true if card number, cvv, and expiry date are all valid

#### `cruPayments.creditCard.encrypt(cardNumber, cvv, month, year)`
Returns an Observable of that emits the results of the tokenization. If a `Promise` is desired, call `.toPromise()` on this Observable. `cruPayments.creditCard.init` must have been called first.

#### Card Number

##### `cruPayments.creditCard.card.validate.minLength(cardNumber)`
Returns true if card number has a valid min length

##### `cruPayments.creditCard.card.validate.maxLength(cardNumber)`
Returns true if card number has a valid max length

##### `cruPayments.creditCard.card.validate.knownType(cardNumber)`
Returns true if card type is known by the system

##### `cruPayments.creditCard.card.validate.typeLength(cardNumber)`
Returns true if card type is known by the system and the length is valid for that type

##### `cruPayments.creditCard.card.validate.checksum(cardNumber)`
Returns true if the card number's checksum is valid

##### `cruPayments.creditCard.card.validate.all(cardNumber)`
Returns true if all of the above card validators return true

##### `cruPayments.creditCard.card.errors(cardNumber)`
Returns an array of error message strings. For each invalid validator above (excluding `all`, a string containing an error message for that validator will be added in the above order.

##### `cruPayments.creditCard.card.info.type(cardNumber)`
Returns `'Visa'`, `'MasterCard'`, `'American Express'`, `'Discover'`, `'Diners Club'`, or `''` (if the type is unknown)

##### `cruPayments.creditCard.card.info.expectedLengthForType(cardNumber)`
Returns an array containing the lengths allowed for the detected type. Could be useful in creating error messages.


#### Card CVV

##### `cruPayments.creditCard.cvv.validate.minLength(cvv)`
Returns true if card cvv has a valid min length

##### `cruPayments.creditCard.cvv.validate.maxLength(cvv)`
Returns true if card cvv has a valid max length

##### `cruPayments.creditCard.cvv.validate.cardTypeLength(cvv, cardType)`
Returns true if card cvv length matches the allowed lengths for the given card type

##### `cruPayments.creditCard.cvv.validate.all(cvv, cardNumber)`
Returns true if all of the above cvv validators return true

#### Card Expiry Date

##### `cruPayments.creditCard.expiryDate.validate.month(month, year)`
Returns true if the expiration date is the current month or in the future

##### `cruPayments.creditCard.expiryDate.validate.year(year)`
Returns true if the year is not in the past

##### `cruPayments.creditCard.expiryDate.validate.all(month, year)`
Alias for `cruPayments.creditCard.expiryDate.validate.month`


### Bank Account

Note: Use `cruPayments` instead of `cruPayments.bankAccount` if using `cru-payments-ba.js`

#### `cruPayments.bankAccount.init(environment, backupKey)`
Must be called at least once before calling `cruPayments.bankAccount.encrypt`. If environment is `'production'`, it will grab the encryption key from CCP's production servers, otherwise it will use CCP's staging servers. If the `backupKey` is provided, it will be used when fetching a key from CCP's servers fails.

#### `cruPayments.bankAccount.validate(routingNumber, accountNumber)`
Returns true if routing number and account number are valid

#### `cruPayments.bankAccount.encrypt(accountNumber)`
Returns an Observable of that emits the results of the account number encryption. If a `Promise` is desired, call `.toPromise()` on this Observable. `cruPayments.bankAccount.init` must have been called first.

#### Routing Number

##### `cruPayments.bankAccount.routingNumber.validate.length(routingNumber)`
Returns true if routing number has a valid length

##### `cruPayments.bankAccount.routingNumber.validate.checksum(routingNumber)`
Returns true if routing number has a valid checksum

##### `cruPayments.bankAccount.routingNumber.validate.all(routingNumber)`
Returns true if all of the above routing number validators return true

#### Account Number

##### `cruPayments.bankAccount.accountNumber.validate.minLength(accountNumber)`
Returns true if account number has a valid min length

##### `cruPayments.bankAccount.accountNumber.validate.maxLength(accountNumber)`
Returns true if account number has a valid max length

##### `cruPayments.bankAccount.accountNumber.validate.all(accountNumber)`
Returns true if all of the above account number validators return true


## Development

### Installing

`yarn` or `npm install`

#### Start local web server

`yarn run start` or `npm run start`

#### Build library

`yarn run build` or `npm run build`

#### Lint

`yarn run lint` or `npm run lint`

#### Run tests

`yarn run test` or `npm run test`
