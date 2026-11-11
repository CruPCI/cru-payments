import {cleanInput} from '../../utils/parsing';

// Convert 2-digit years (MM/YY input) to 4-digit years. Assumes 20xx.
function normalizeYear(inputYear: string|number){
  const year = Number(cleanInput(inputYear));
  return year > 0 && year < 100 ? year + 2000 : year;
}

export function validateMonth(inputMonth: string|number, inputYear: string|number){
  const month = Number(cleanInput(inputMonth));
  const year = normalizeYear(inputYear);
  const currentDate = new Date();
  return month >= 1 && month <= 12 &&
    (year > currentDate.getFullYear() ||
    year === currentDate.getFullYear() && month >= currentDate.getMonth() + 1);
}

export function validateYear(inputYear: string|number){
  const year = normalizeYear(inputYear);
  const currentYear = (new Date()).getFullYear();
  return year >= currentYear && year <= currentYear + 50;
}

export function errors(inputMonth: string|number, inputYear: string|number){
  const month = Number(cleanInput(inputMonth));
  const year = normalizeYear(inputYear);
  let errors: string[] = [];
  if(!month){
    errors.push('Month cannot be blank');
  }
  if(!year){
    errors.push('Year cannot be blank');
  }
  if(year && !validateYear(year)){
    errors.push(year > (new Date()).getFullYear() ? 'Year is too far in the future' : 'Year cannot be in the past');
  }
  if(month && !validateMonth(month, year)){
    errors.push('Month cannot be in the past');
  }
  return errors;
}
