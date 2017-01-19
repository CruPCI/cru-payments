# Cru Payments
[![Build Status](https://travis-ci.org/CruGlobal/cru-payments.svg?branch=master)](https://travis-ci.org/CruGlobal/cru-payments)
[![codecov](https://codecov.io/gh/CruGlobal/cru-payments/branch/master/graph/badge.svg)](https://codecov.io/gh/CruGlobal/cru-payments)

## Usage

### Importing

#### Import package
TODO: publish as package somewhere

#### Build and use locally
1. `yarn` or `npm install`
2. `yarn run build` or `npm run build`
3. Use `dist/cru-payments.js` (credit cards and bank accounts), `dist/cru-payments-ba.js` (bank accounts only), or `dist/cru-payments-cc.js` (credit cards only) in your app

### API

#### Credit Card

Note: Use `cruPayments` instead of `cruPayments.creditCard` if using `cru-payments-cc.js`

##### `cruPayments.creditCard.init(environment, deviceId, manifest)`
Must be called at least once before calling `cruPayments.creditCard.encrypt`. If environment is `'production'`, it will grab the code from TSYS's production servers, otherwise it will use TSYS's staging servers.

##### `cruPayments.creditCard.validate(cardNumber, cvv, month, year)`
Returns true if card number, cvv, and expiry date are all valid

##### `cruPayments.creditCard.encrypt(cardNumber, cvv, month, year)`
Returns an Observable of that emits the results of the tokenization. If a `Promise` is desired, call `.toPromise()` on this Observable. `cruPayments.creditCard.init` must have been called first.

##### Card Number

###### `cruPayments.creditCard.card.validate.minLength(cardNumber)`
Returns true if card number has a valid min length

###### `cruPayments.creditCard.card.validate.maxLength(cardNumber)`
Returns true if card number has a valid max length

###### `cruPayments.creditCard.card.validate.knownType(cardNumber)`
Returns true if card type is known by the system

###### `cruPayments.creditCard.card.validate.typeLength(cardNumber)`
Returns true if card type is known by the system and the length is valid for that type

###### `cruPayments.creditCard.card.validate.checksum(cardNumber)`
Returns true if the card number's checksum is valid

###### `cruPayments.creditCard.card.validate.all(cardNumber)`
Returns true if all of the above card validators return true

###### `cruPayments.creditCard.card.errors(cardNumber)`
Returns an array of error message strings. For each invalid validator above (excluding `all`, a string containing an error message for that validator will be added in the above order.

###### `cruPayments.creditCard.card.info.type(cardNumber)`
Returns `'Visa'`, `'MasterCard'`, `'American Express'`, `'Discover'`, `'Diners Club'`, or `''` (if the type is unknown)

###### `cruPayments.creditCard.card.info.expectedLengthForType(cardNumber)`
Returns an array containing the lengths allowed for the detected type. Could be useful in creating error messages.


##### Card CVV

###### `cruPayments.creditCard.cvv.validate.minLength(cvv)`
Returns true if card cvv has a valid min length

###### `cruPayments.creditCard.cvv.validate.maxLength(cvv)`
Returns true if card cvv has a valid max length

###### `cruPayments.creditCard.cvv.validate.all(cvv)`
Returns true if all of the above cvv validators return true

##### Card Expiry Date

###### `cruPayments.creditCard.expiryDate.validate.month(month, year)`
Returns true if the expiration date is the current month or in the future

###### `cruPayments.creditCard.expiryDate.validate.year(year)`
Returns true if the year is not in the past

###### `cruPayments.creditCard.expiryDate.validate.all(month, year)`
Alias for `cruPayments.creditCard.expiryDate.validate.month`


#### Bank Account

TODO


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
