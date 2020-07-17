import {FormControl, ValidationErrors, Validators} from '@angular/forms';


export class CustomValidators extends Validators {
  protected readonly CLASSNAME = 'ValidationService';

  constructor(){
    super();
  }

  public static AlphaNumericWithSelectedSpecialCharacters(control:FormControl):ValidationErrors {
    // let regex = new RegExp(CONSTANTS.regex.IsAlphaNumericWithSelectedSpecialCharactersRegEx);
    // if (!regex.test(control.value)) {
    //   control.setValue('');
    //
    //   return {error: CONSTANTS.errorMessages.invalidValue};
    // }

    return null;
  }
}
