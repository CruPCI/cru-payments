// adapted from http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers#JavaScript

const luhnArray = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

export function luhnCheck(cardNumber: string) {
  let counter = 0;
  let odd = false;
  for (let i = cardNumber.length - 1; i >= 0; --i) {
    const digit = parseInt(cardNumber.charAt(i), 10);
    odd = !odd;
    counter += odd ? digit : luhnArray[digit];
  }
  return counter % 10 === 0;
}
