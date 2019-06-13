export function stripNonDigits(number: string): string {
  return number.replace(/\D/g, '');
}

export function cleanInput(number: string | number): string {
  const numberString = String(number);
  return stripNonDigits(numberString);
}
