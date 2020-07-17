import {Pipe, PipeTransform} from '@angular/core';

import * as moment from 'moment';

@Pipe({name: 'remainingTime'})

export class RemainingTimePipe implements PipeTransform {
  protected readonly CLASSNAME = 'RemainingTimePipe';

  transform(value: moment.Moment) {
    try {
      let remaining = value.diff(moment()),
        remainingUtc = moment.utc(remaining);

      return `${remainingUtc.minute().toString()}:${remainingUtc.second().toString().padStart(2,'0')}`;
    }
    catch (err) {
      return '';
    }
  }
}
