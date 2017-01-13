export function validateExpiryDate(month: number, year: number){
  const currentDate = new Date();
  return month >= 1 && month <= 12 &&
    (year > currentDate.getFullYear() ||
    year === currentDate.getFullYear() && month >= currentDate.getMonth() + 1);
}
