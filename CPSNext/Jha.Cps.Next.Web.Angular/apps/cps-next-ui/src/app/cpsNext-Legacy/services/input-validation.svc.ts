import { Injectable} from '@angular/core';


// Example call from view ( html tag)
// (keypress)="validateEntry($event)" 
@Injectable()

export class InputValidationService {
    protected readonly CLASSNAME = 'InputValidationService';

    constructor() {}

    //************************
    // Uses (keypress) event
    //************************
    // Allow only Alpha characters
    public alphaOnly(env, spaceCharacterAllowed: boolean = true) {
        const key = env.keyCode;
        let ret = false;

        if(spaceCharacterAllowed) {
            ret = (  
                (key >='a'.charCodeAt(0) && key <='z'.charCodeAt(0)) ||
                (key >='A'.charCodeAt(0) && key <= 'Z'.charCodeAt(0)) ||
                (key === 32)
            );
        } else {
            ret = (  
                (key >='a'.charCodeAt(0) && key <='z'.charCodeAt(0)) ||
                (key >='A'.charCodeAt(0) && key <= 'Z'.charCodeAt(0)) 
            );
        }

        return ret;
    }

    // ALlow only Numeric characters
    public numericOnly(env) {
        const key = env.keyCode;

        const ret = ((key >= 48 && key <= 57));

        return ret;
    }

    public AllowDecimals(env) {
              
        const key = env.keyCode;
        // if (key == 8 || key == 46) {
        //   //BACKSPACE or DELETE was pressed
        //   return;
        // }

        const reg = /^\d*(\.?\d{0,10})$/;
        let value = (env.srcElement.value ? env.srcElement.value : '') + env.key;
        
        let outputvalue = reg.test(value);
        if (!outputvalue) {
          event.preventDefault()
        }
        else
        {
            return outputvalue
        }
      }
    public numeric_AndDistinctCharactersOnly(env, listOfCharacters:string = '') {
        const key = env.keyCode;

        const ret = ((key >= 48 && key <= 57) ||
          ((listOfCharacters.indexOf(env.key)) > -1 ) );

          return ret;
    }

    public alphaNumericOnly(env, spaceCharacterAllowed: boolean = true) {
        const key = env.keyCode;
        let ret = false;

        if( spaceCharacterAllowed) {
            ret = (  
                (key >='a'.charCodeAt(0) && key <='z'.charCodeAt(0)) ||
                (key >='A'.charCodeAt(0) && key <= 'Z'.charCodeAt(0)) ||
                (key >= 48 && key <= 57)  ||
                (key === 32 )
            );

        } else {
        ret = (  
            (key >='a'.charCodeAt(0) && key <='z'.charCodeAt(0)) ||
            (key >='A'.charCodeAt(0) && key <= 'Z'.charCodeAt(0)) ||
            (key >= 48 && key <= 57)  
         );
        }

        return ret;
    }


    public alphaNumeric_SpecialCharactersOnly(env) {
        const key = env.keyCode;
    
        const ret = ( 
          (key >='a'.charCodeAt(0) && key <='z'.charCodeAt(0)) ||
          (key >='A'.charCodeAt(0) && key <= 'Z'.charCodeAt(0)) ||
          (key >= 48 && key <= 57) ||
          (
          key === '<'.charCodeAt(0) ||
          key === '>'.charCodeAt(0) ||
          key === '$'.charCodeAt(0) ||
          key === '&'.charCodeAt(0) ||
          key === '#'.charCodeAt(0) 
          )
          );
    
          return ret;
      }

      public alphaNumeric_AndDistinctCharactersOnly(env,listOfCharacters:string = "") {
        const key = env.keyCode;

        const ret = ( 
          (key >='a'.charCodeAt(0) && key <='z'.charCodeAt(0)) ||
          (key >='A'.charCodeAt(0) && key <= 'Z'.charCodeAt(0)) ||
          (key >= 48 && key <= 57)  ||
          ((listOfCharacters.indexOf(env.key)) > -1 )
          );
    
          return ret;
      }

      public denyCharacters(env, listOfCharacters:string="") {

          return ( listOfCharacters.indexOf(env.key) === -1);
      }

      public passwordCharactersOnly(env) {
        const key = env.keyCode;
    
//        const ret = ( key !== ' ');
        const ret = true;
    
          return ret;
      }
}