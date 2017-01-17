import * as _ from 'lodash';
const cardTypes = [
  {
    name: 'VISA',
    displayName: 'Visa',
    lengths: [13, 16],
    prefixExpression: '4'
  },
  {
    name: 'MASTERCARD',
    displayName: 'MasterCard',
    lengths: [16],
    prefixExpression: '5[1-5]'
  },
  {
    name: 'AMERICAN_EXPRESS',
    displayName: 'American Express',
    lengths: [15],
    prefixExpression: '3[4,7]'
  },
  {
    name: 'DISCOVER',
    displayName: 'Discover',
    lengths: [16],
    prefixExpression: '((65)|(64[4-9])|(622)|(6011)|(35[2-8]))'
  },
  {
    name: 'DINERS_CLUB',
    displayName: 'Diners Club',
    lengths: [14],
    prefixExpression: '((36)|(30[0-5]))'
  }
];

export function validateKnownType(cardNumber: string){
  return !!getCardType(cardNumber);
}

export function validateTypeLength(cardNumber: string){
  return lengthValid(getCardType(cardNumber), cardNumber);
}

export function getCardTypeName(cardNumber: string){
  const cardType = getCardType(cardNumber);
  return cardType ? cardType.displayName : '';
}

export function expectedLength(cardNumber: string){
  const cardType = getCardType(cardNumber);
  return cardType && cardType.lengths;
}

function getCardType(cardNumber: string) {
  return _.find(cardTypes, cardType => {
    const cardExpression = new RegExp('^' + cardType.prefixExpression);
    return cardExpression.test(cardNumber);
  });
}

function lengthValid(cardType: any, cardNumber: string) {
  return _.includes(cardType && cardType.lengths, cardNumber.length);
}

