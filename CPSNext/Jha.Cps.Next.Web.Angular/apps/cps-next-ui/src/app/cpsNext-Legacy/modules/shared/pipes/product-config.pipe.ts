import {Pipe, PipeTransform} from '@angular/core';

import * as moment from 'moment';
import {IConfigItem} from '@entities/models';

@Pipe({name: 'productConfig'})

export class ProductConfigPipe implements PipeTransform {
  protected readonly CLASSNAME = 'ProductConfigPipe';

  transform(value: IConfigItem) {
    try {
      switch(value.dataType.toLowerCase()){
        case 'boolean':
          return value.value === 'Y' ? 'Yes' : 'No';
        case 'datetime':
          return moment(value.value).format('L');
        case 'number':
          return parseInt(value.value).toString();
        case 'string':
          return value.value;
      }
    }
    catch (err) {
      return '';
    }
  }
}
