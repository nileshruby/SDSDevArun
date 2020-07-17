import { Directive, ElementRef, HostListener, Input, Sanitizer, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[secureInputValidate]'
})
export class SecureInputValidateDirective {
    private readonly CLASSNAME = 'SecureInputValidateDirective';
    @Input() errorMessage;
    @Input() formControlName;
    @Input() name; 
    @Input() InputValidate;
    @Input() MaxLength;
    @Input() MinL;
    @Input() secureInputValidate;

    sanitizer: DomSanitizer;
    errorInput: Boolean = false;
    

    @HostListener('blur',['$event'])
    // @HostListener('change',['$event'])
    @HostListener('keyup',['$event'])

    onInputChange() {
        let newVal = this.el.nativeElement.value;
        // let errorInput: Boolean = false;
        const UpString = newVal.toUpperCase();

        // const vvv = this.sanitizer.sanitize(SecurityContext.SCRIPT, newVal);
        // let errormsg = 'Field is required';
        let errormsg = '';
        if (this.errorMessage && this.errorMessage !== '') {
            errormsg = this.errorMessage;
        }
        const badStrings: string[] = ['DELETE ', 'UPDATE ', 'SELECT ','INSERT ',
        '<SCRIPT', '<','>'];

        this.errorInput = false;
        badStrings.forEach(v => {
            if(UpString.indexOf(v)>=0)
                this.errorInput = true;
        });

        if(this.errorInput) {
            // this.el.nativeElement.value = '';
        }

        const msg = (this.errorInput) ? 'Invalid Input detected, please check content !' : errormsg;
        let classs = this.formControlName && this.formControlName  != '' ? this.formControlName :  ( this.name && this.name  != '' ? this.name : this.el.nativeElement.type ) + '_error';
        if (newVal === '' || this.errorInput === true) {
            this.el.nativeElement.style.border = '1px solid red';
            let html =  ' <span class="' + classs + '" style="color: rgb(180, 12, 12);">' + msg + '</span> ';
            if (!$("span").hasClass(classs)) {
                $(this.el.nativeElement).after(html);
            }
        } 
        else {
            this.el.nativeElement.style.border = '';
            $('.'+classs).remove();
        }
    }

    constructor(private el:ElementRef) { 
        this.errorInput = false;
    }
}