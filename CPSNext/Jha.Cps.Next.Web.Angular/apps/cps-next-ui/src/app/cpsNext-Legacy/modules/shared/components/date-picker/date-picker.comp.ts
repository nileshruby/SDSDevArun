import {Component, ViewEncapsulation, Input, ElementRef, EventEmitter, Output, OnInit, forwardRef,} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {LoggingService} from '@app/services';
import * as moment from 'moment';

@Component({
  selector: 'date-picker',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./date-picker.scss'],
  template: `
    <div class="date-range-picker">
      <input class="screen form-control"
             [value]="displayValue"
             (focus)="onInputFocus()"
             (blur)="onInputBlur()"
             (keyup)="onInputKeyUp($event)"
              placeholder="{{format}}"/>
      <div class="dp-container"
           [ngClass]="{'open': isOpen}"
           (mouseenter)="onMouseEnter()"
           (mouseleave)="onMouseLeave()">
        <div class="dp-main">
          <ul class="dp-month dp-month-start" *ngIf="currentMonth">
            <li class="dp-month-header">
              <a class="nav-month-back" (click)="navMonth(-1)"
                 (dblclick)="navMonth('start',-1)">
              </a>
              <a class="nav-month-fwd" (click)="navMonth(1)"
                 (dblclick)="navMonth('start',1)">
              </a>
              <label class="date_label">{{currentMonth.moment.format('MMMM YYYY')}}</label>
            </li>
            <li class="dp-month-days">
              <ul>
                <li class="dp-dow-header" *ngFor="let dowTitle of weekDayHeaders">
                  <span>{{dowTitle}}</span>
                </li>
                <li *ngFor="let day of currentMonth.days"
                    class="dp-day {{day.classes || ''}}"
                    [ngClass]="{'selected': day.isSelected, 'today': day.isToday}"
                    (click)="selectDate(day)">
                  <label *ngIf="day.day > 0">
                    {{day.day}}
                  </label>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})

export class DatePickerComponent implements OnInit, ControlValueAccessor {
  private CLASSNAME = 'DatePickerComponent';

  @Input() format = 'MM/DD/YYYY';
  @Input() showDefaultDate = true;
  @Output() onDateChanged = new EventEmitter<any>();

  public weekDayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  public onChange: any = () => { };
  public onTouched: any = () => { };

  public get value():moment.Moment {
    return this.selectedDate.clone();
  }

  public set value(value:moment.Moment) {
    if(!value)
      this.selectedDate = moment();
    else if(moment.isMoment(value) && value.clone)
      this.selectedDate = value.clone();
    else if(typeof value === 'string')
      this.selectedDate = moment(value, this.format);
    else
      this.selectedDate = moment();

    this.setDisplayValue();
    this.showDefaultDate = true;
    this.onChange(value);
    this.onTouched();
  }

  public $picker: any;
  public $input: any;
  public isOpen: boolean = false;

  public currentMonth: any;
  public selectedDate = moment();
  public displayValue: string;

  private _focus: boolean = false;
  private _hover: boolean = false;

  constructor(private elementRef: ElementRef,
              private _log: LoggingService) {
  }

  ngOnInit() {
    this.$picker = jQuery(this.elementRef);
    this.$input = jQuery(this.elementRef.nativeElement.querySelector('input.screen'));
    // this._log.info(`${this.CLASSNAME} > ngOnInit`, this.$picker, this.$input);
  }

  public init() {
    // this._log.info(`${this.CLASSNAME} > init() > displayValue: ${this.displayValue}`, this.selectedDate);

    this.setDisplayValue();
    this.setMonthObject();
    this.setSelectedDay();
  }

  public registerOnChange(fn) {
    this.onChange = fn;
  }

  public registerOnTouched(fn) {
    this.onTouched = fn;
  }

  public writeValue(value) {
    this.value = value;
  }

  public clearDisplay(){
    this.displayValue = '';
  }
  
  public setDisplayValue() {
    if (!this.selectedDate) return;
    if (!this.showDefaultDate) {
      this.displayValue = '';
      return;
    }
    // REMOVE TIME
    this.selectedDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});

    // DISPLAY TEXT
    if (this.selectedDate && moment.isMoment(this.selectedDate))
      this.displayValue = this.selectedDate.format('MM/DD/YYYY');
    else
      this.displayValue = '';

    // this._log.info(`${this.CLASSNAME} > setDisplayValue > displayValue: ${this.displayValue}`, this.selectedDate);
  }

  public setMonthObject() {
    this.currentMonth = {
      moment: this.selectedDate.clone().startOf('month'),
      days: this.getDaysForMonth(this.selectedDate)
    };
    this.currentMonth.year = this.currentMonth.moment.year();
    this.currentMonth.month = this.currentMonth.moment.month();
  }

  public getDaysForMonth(date) {
    this._log.info(`${this.CLASSNAME} > getDaysForMonth > date`, date);

    let m = date.clone().startOf('month');
    let dim = m.daysInMonth();
    let month = m.month();
    let year = m.year();
    let days = [];

    let dow = m.day();
    for (let i = 0; i < dow % 7; i++) {
      days.push({
        day: 0,
        month: 0,
        year: 0,
        classes: '',
        selected: false
      });
    }

    for (let i = 1; i <= dim; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        classes: 'dom ' + (dow > 0 && dow < 6 ? 'weekday' : 'weekend'),
        selected: false
      });

      dow = dow % 7;
    }

    return days;
  }

  public setSelectedDay() {
    let sDay: number, sMonth: number, sYear: number;

    let now = moment(),
      cDay = now.date(),
      cMonth = now.month(),
      cYear = now.year();

    try {
      sDay = this.selectedDate.date() || 0;
      sMonth = this.selectedDate.month() || 0;
      sYear = this.selectedDate.year() || 0;

      for (let day of this.currentMonth.days) {
        day.isSelected = day.day === sDay && day.day > 0 &&
          this.currentMonth.month === sMonth &&
          this.currentMonth.year === sYear;

        day.isToday = day.day === cDay && day.day > 0 &&
          this.currentMonth.month === cMonth &&
          this.currentMonth.year === cYear;
      }
    }
    catch (err) {
      this._log.error(`${this.CLASSNAME} > setSelectedDays:`, err);
    }
  }

  public parseDateString(val = ''): boolean {
    if (!val) return false;

    // Start and End Dates
    let s = moment(val.trim(), this.format);

    if (!s.isValid()) {
      this._log.debug(`${this.CLASSNAME} > parseDateString: Invalid Date Range (${val})`);
      return false;
    }

    this.value = s;

    // this.selectedDate = s;
    // this.applySelection();
  }

  public selectDate(day) {
    this._log.info(`${this.CLASSNAME} > selectDate > day`, day);

    if (isNaN(day.year) || isNaN(day.month) || isNaN(day.day)) return;

    let s = moment([day.year, day.month, day.day]);

    if (!s.isValid()) {
      this._log.debug(`${this.CLASSNAME} selectDate - Invalid Date:`, day);
      return false;
    }

    this.value = s;
    this.setSelectedDay();
    
    // this.selectedDate = s;
    // this.applySelection();
  }

  public applySelection() {
    this._log.info(`${this.CLASSNAME} > applySelections > selectedDate`, this.selectedDate);

    if (this.selectedDate) {
      this.setDisplayValue();

      this.onChange.emit({
        date: this.selectedDate.clone()
      });
    }

    this.close(true);
  }

  public navMonth(months: number) {
    if (!months) return;

    // this._log.info(`${this.CLASSNAME} > navMonth > months: ${months}`);
    this.currentMonth.moment.add(months, 'M');
    this.currentMonth.days = this.getDaysForMonth(this.currentMonth.moment);
    this.currentMonth.year = this.currentMonth.moment.year();
    this.currentMonth.month = this.currentMonth.moment.month();

    this.setSelectedDay();

    if (this.$input)
      this.$input.focus().select();
  }

  public navYear(years: number) {
    // this._log.info(`${this.CLASSNAME} > navYear > years: ${years}`);

    if (!years) return;
    this.navMonth(years * 12);
  }

  public open() {
    if (!this.isOpen) {
      this.isOpen = true;

      this.init();

      if (this.$input)
        this.$input.focus().select();
    }
  }

  public close(force = false) {
    if (force) {
      this._focus = false;
      this._hover = false;
      this.isOpen = false;
    }
    else if (!this._hover && !this._focus)
      this.isOpen = false;
  }

  public onInputKeyUp($e) {
    let val = $e.target.value;

    if (val.length > 0) {
      switch ($e.keyCode) {
        case 27: // Esc
          this.close(true);
          break;
        case 13: // Enter
          this.parseDateString(val);
          break;
        default:
          break;
      }
    }
    let s = moment(val);
    if (s.isValid()) {
      this.value = s;
      this.setSelectedDay();
    }
  }

  public onInputFocus() {
    this._focus = true;
    this.open();
  }

  public onInputBlur() {
    this._focus = false;
    this.close();
  }

  public onMouseEnter() {
    if (this.isOpen)
      this._hover = true;
  }

  public onMouseLeave() {
    this._hover = false;
    setTimeout(this.close.bind(this), 1000);
  }
}
