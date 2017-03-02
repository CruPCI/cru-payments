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

export function errors(inputMonth: string|number, inputYear: string|number){
  const month = Number(cleanInput(inputMonth));
  const year = Number(cleanInput(inputYear));
  let errors: string[] = [];
  if(!month){
    errors.push('Month cannot be blank');
  }
  if(!year){
    errors.push('Year cannot be blank');
  }
  if(year && !validateYear(year)){
    errors.push('Year cannot be in the past');
  }
  if(month && !validateMonth(month, year)){
    errors.push('Month cannot be in the past');
  }
  return errors;
}
