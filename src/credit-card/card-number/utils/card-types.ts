import {cleanInput} from '../../../utils/parsing';

export const cardTypeConsts = [
  {
    name: 'Visa',
    lengths: [13, 16],
    prefixExpression: '4',
    cvvLengths: [3]
  },
  {
    name: 'MasterCard',
    lengths: [16],
    prefixExpression: '5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720',
    cvvLengths: [3]
  },
  {
    name: 'American Express',
    lengths: [15],
    prefixExpression: '3[47]',
    cvvLengths: [4]
  },
  {
    name: 'Discover',
    lengths: [16],
    // 622126-622925 is the UnionPay range that interoperates with the Discover network
    // 3528-3589 is the JCB range, which is processed on the Discover network in the US
    prefixExpression: '65|64[4-9]|62212[6-9]|6221[3-9][0-9]|622[2-8][0-9][0-9]|6229[01][0-9]|62292[0-5]|6011|35(2[89]|[3-8][0-9])',
    cvvLengths: [3]
  },
  {
    name: 'Diners Club',
    lengths: [14, 16],
    prefixExpression: '36|3[89]|30[0-5]|3095',
    cvvLengths: [3]
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
  return cardType ? cardType.name : '';
}

export function expectedLength(cardNumber: string){
  const cardType = getCardType(cleanInput(cardNumber));
  return cardType && cardType.lengths;
}

function getCardType(cardNumber: string) {
  for(const cardType of cardTypeConsts) {
    const cardExpression = new RegExp('^(' + cardType.prefixExpression + ')');
    if(cardExpression.test(cardNumber)){
      return cardType;
    }
  }
}

function lengthValid(cardType: any, cardNumber: string) {
  if(cardType && cardType.lengths){
    for(const length of cardType.lengths){
      if(length === cardNumber.length)
        return true;
    }
  }
  return false;
}

