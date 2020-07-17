import {AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';

import {LoggingService} from '@app/services';

@Directive ({
    selector:  '[USPhoneFormat]',
})

export class PhoneNumberDirective {
    private readonly CLASSNAME = 'PhoneNumberDirective';
    // private masked = "(XXX) XXX-" + input.Substring(input.Length - 4); 
    // public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

    @HostListener('mouseover',['$event'])
    @HostListener('keydown',['$event'])
    onInputChange() {
         // remove all mask characters (keep only numeric)
        //  console.log('Input Value raw: ' + this.el.nativeElement.value);
    let newVal = this.el.nativeElement.value.replace(/\D/g, '');
    // console.log('Input Value raw after clean up: ' + newVal);

    // if (backspace) {
    //   newVal = newVal.substring(0, newVal.length - 1);
    // }

    // don't show braces for empty value
    if (newVal.length === 0) {
      newVal = '';
    }

    else if (newVal.length <=2 && newVal.length > 1) {
        newVal = newVal.replace(/^(\d{0,3})/, '($1');
      }
    // don't show braces for empty groups at the end
    else if (newVal.length <= 3) {
      // newVal = newVal.replace(/^(\d{0,3})/, '($1)');
    } else if (newVal.length <= 6) {
      // newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2-');
    } else {
      newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(.*)/, '($1) $2-$3');
    }
    // console.log('New Value 0: ' + this.el.nativeElement.value);

    if(newVal.length > 14) {
       newVal = newVal.slice(0, 14); 
    }
    // set the new value
    // this.el.nativeElement.value.writeValue(newVal);       
    this.el.nativeElement.value = newVal;
    // console.log('New Value 1: ' + this.el.nativeElement.value);

    }

    

    @Input() phoneNumber;
    constructor(private el:ElementRef, ) {
        // el.nativeElement.style.backgroundColor = 'yellow';
    }
}
