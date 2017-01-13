export function stripNonDigits(number: string){
  return number.replace(/\D/g, '');
}

export function cleanInput(number: string|number){
  let numberString: string = String(number);
  numberString = stripNonDigits(numberString);
  return numberString;
}
