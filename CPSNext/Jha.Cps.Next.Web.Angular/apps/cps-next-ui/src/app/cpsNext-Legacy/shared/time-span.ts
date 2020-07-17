import { WeekDay } from "@angular/common";

export class TimeSpan {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  expired: boolean = false;

  constructor() {
    var date = new Date();
  }

  getTotalMilliseconds(): number {
    let result: number = 0;
    result += this.milliseconds;
    result += this.seconds * 1000;
    result += this.minutes * 60 * 1000;
    result += this.hours * 60 * 60 * 1000;

    return result;
  }

  static subtract(minuend: Date, subtrahend: Date): TimeSpan {
    let result = new TimeSpan();
    if (minuend.valueOf() < subtrahend.valueOf()) {
      result.expired = true;
    } else {
      let min_milliseconds = minuend.getMilliseconds();
      let min_seconds = minuend.getSeconds();
      let min_minute = minuend.getMinutes();
      let min_hour = minuend.getHours();

      let sub_milliseconds = subtrahend.getMilliseconds();
      let sub_seconds = subtrahend.getSeconds();
      let sub_minute = subtrahend.getMinutes();
      let sub_hour = subtrahend.getHours();

      if (0 > min_milliseconds - sub_milliseconds) {
        --min_seconds;
        min_milliseconds += 1000;
      }
      result.milliseconds = min_milliseconds - sub_milliseconds;

      if (0 > min_seconds - sub_seconds) {
        --min_minute;
        min_seconds += 60;
      }
      result.seconds = min_seconds - sub_seconds;

      if (0 > min_minute - sub_minute) {
        --min_hour;
        min_minute += 60;
      }
      result.minutes = min_minute - sub_minute;

      result.hours = min_hour - sub_hour;
    }
    return result;
  }
}
