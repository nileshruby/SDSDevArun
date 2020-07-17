import {Pipe, PipeTransform} from '@angular/core';


@Pipe({name: 'usphone'})

export class PhoneFormatPipe implements PipeTransform {
  protected readonly CLASSNAME = 'PhoneFormatPipe';

  transform(val: string, args) {
    try {
        let cleaned = ('' + val).replace(/\D/g,'');
        let newFormat = '';

        if(cleaned.length > 0) {
          newFormat = '(' + cleaned.substr(0, 3) + ') ' + cleaned.substr(3, 3) + '-' + cleaned.substr(6);
        } else {
          newFormat = '';
        }
      return newFormat;
    }
    catch (err) {
      return '';
    }
  }
}
