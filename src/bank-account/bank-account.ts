import * as _ from 'lodash';

export function validateRoutingNumber(routingNumber: string|number = ''){
    const routingNumberString: string = String(routingNumber);
    let digits = routingNumberString.split('');
    if(Number(digits[0]) > 3) return false; // Added to match EP validation https://github.com/CruGlobal/give-ep-extensions/blob/develop/cortex/resources/bank-account-resource/src/main/java/com/elasticpath/extensions/rest/resource/bankaccounts/validator/BankAccountValidator.java#L57
    let multipliers = [3, 7, 1, 3, 7, 1, 3, 7, 1];

    let checksum = _(digits)
      .zip(multipliers)
      .map((array: [number, number]) => {
        return array[0] * array[1];
      })
      .sum();
    return checksum !== 0 && checksum % 10 === 0;
}
