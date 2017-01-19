import {cleanInput} from '../../utils/parsing';

export function validateMonth(inputMonth: string|number, inputYear: string|number){
  const month = Number(cleanInput(inputMonth));
  const year = Number(cleanInput(inputYear));
  const currentDate = new Date();
  return month >= 1 && month <= 12 &&
    (year > currentDate.getFullYear() ||
    year === currentDate.getFullYear() && month >= currentDate.getMonth() + 1);
}

export function validateYear(inputYear: string|number){
  const year = Number(cleanInput(inputYear));
  return year >= (new Date()).getFullYear();
}
