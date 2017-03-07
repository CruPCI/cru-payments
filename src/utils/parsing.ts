export function stripNonDigits(number: string): string{
  return number.replace(/\D/g, '');
}

export function cleanInput(number: string|number): string{
  let numberString: string = String(number);
  numberString = stripNonDigits(numberString);
  return numberString;
}
