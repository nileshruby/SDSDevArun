import {Pipe, PipeTransform} from '@angular/core';

import {IProductActivitySearch} from '@entities/models';


@Pipe({name: 'activityItem'})

export class ActivityItemPipe implements PipeTransform {
  protected readonly CLASSNAME = 'ActivityItemPipe';

  transform(value: IProductActivitySearch) {
    try {
      let startTime = value.startDate.format('HH'),
        endTime = value.endDate.format('HH');

      if(startTime === '0')
        startTime = 'midnight';

      if(endTime === '24')
        endTime = 'midnight';

      return startTime + ' - ' + endTime;
    }
    catch (err) {
      return '';
    }
  }
}
