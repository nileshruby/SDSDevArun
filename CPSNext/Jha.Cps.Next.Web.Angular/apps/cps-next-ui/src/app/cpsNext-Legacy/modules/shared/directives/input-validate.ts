import { ValidateSecurityAnswerRequest } from './../../../models/validatesecurityanswer';
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[inputValidate]'
})
export class InputValidateDirective {
    private readonly CLASSNAME = 'InputValidateDirective';
    @Input() errorMessage;
    @Input() formControlName;
    @Input() name; 
    @Input() InputValidate;
    @Input() MaxLength;
    @Input() MinL;

    @HostListener('blur',['$event'])
    @HostListener('change',['$event'])
    @HostListener('keyup',['$event'])

    onInputChange() {
        let newVal = this.el.nativeElement.value;
        let errormsg = 'Field is required';
        if (this.errorMessage && this.errorMessage !== '') {
            errormsg = this.errorMessage;
        }

        const vv = this.MaxLength;
        const lng = this.el.nativeElement.value.length;
        const validMaxLength = ( (!this.MaxLength) || ( this.el.nativeElement.value.length <= this.MaxLength))? true : false;
        const validMinLength = ( (!this.MinL) || ( this.el.nativeElement.value.length === 0 || 
            this.el.nativeElement.value.length >= this.MinL))? true : false;

        if(validMinLength===false) {
            errormsg = 'Minimun length is ' + this.MinL + '.';
        } else if (validMaxLength===false) {
            errormsg = 'Maximum length is ' + this.MaxLength + '.';
        } 
        

        const validLength = ( 
            validMaxLength && validMinLength
        )? true : false;

        let classs = this.formControlName && this.formControlName  != '' ? this.formControlName :  ( this.name && this.name  != '' ? this.name : this.el.nativeElement.type ) + '_error';
        if (newVal === '' || validLength === false) {
            this.el.nativeElement.style.border = '1px solid red';
            let html =  ' <span class="' + classs + '" style="color: rgb(180, 12, 12);">' + errormsg + '</span> ';
            if (!$("span").hasClass(classs)) {
                $(this.el.nativeElement).after(html);
            }
        } 
        else {
            this.el.nativeElement.style.border = '';
            $('.'+classs).remove();
        }
    }

    constructor(private el:ElementRef) { }
}