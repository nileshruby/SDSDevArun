/**
 * Created by Chris Reed on 2/15/2017.
 */

import {Injectable} from '@angular/core';

import * as $ from 'jquery';
import * as _ from 'lodash';

@Injectable()
export class HelpersService {
  protected readonly CLASSNAME = 'HelpersService';

  public arrays: ArrayHelpers;
  public doms: DomHelpers;
  public numbers: NumberHelpers;
  public strings: StringHelpers;
  public values: ValueHelpers;

  constructor() {
    this.arrays = new ArrayHelpers();
    this.values = new ValueHelpers();
    this.strings = new StringHelpers(this.values);
    this.numbers = new NumberHelpers(this.values, this.strings);
    this.doms = new DomHelpers(this.strings);
  }

  public isDate = (value: any): boolean => {
    return value && value !== null && value !== undefined && value instanceof Date;
  };
}

class ArrayHelpers {

  constructor() {
  }

  public copy = (ar: any[]): any[] => {
    let retAr = [];
    for (let itm of ar) {
      if (_.isArray(itm))
        retAr.push(this.copy(itm));
      else if (typeof itm === 'object')
        retAr.push(_.merge({}, itm));
      else
        retAr.push(itm);
    }
    return retAr;
  };

  public isEqual = (x: any[], y: any[]) => {
    if (x.length === y.length) {
      for (let i = 0; i < x.length; ++i) {
        if (x[i] !== y[i]) {
          return false;
        }
      }

      return true;
    }
    else
      return false;
  };
}

class DomHelpers {

  constructor(private _strings: StringHelpers) {
  }

  public getDimensions = (ctrl: any) => {
    let dims: any = {};

    ctrl = this._checkObj(ctrl);
    if (!ctrl)
      return dims;

    dims.height = ctrl.height();
    dims.width = ctrl.width();

    try {
      dims.padding = this._getPaddings(ctrl);
    }
    catch (err) {
    }

    try {
      dims.border = this._getBorders(ctrl);
    }
    catch (err) {
    }

    try {
      dims.margin = this._getMargins(ctrl);
    }
    catch (err) {
    }

    return dims;

    // dims.padding = {
    //   top: this._strings.onlyNumbers(ctrl.css('padding-top'), true),
    //   right: this._strings.onlyNumbers(ctrl.css('padding-right'), true),
    //   bottom: this._strings.onlyNumbers(ctrl.css('padding-bottom'), true),
    //   left: this._strings.onlyNumbers(ctrl.css('padding-left'), true),
    // };
    // dims.padding.vertical = (dims.padding.top || 0) + (dims.padding.bottom || 0);
    // dims.padding.horizontal = (dims.padding.right || 0) + (dims.padding.left || 0);
    //
    // dims.border = {
    //   top: this._strings.onlyNumbers(ctrl.css('border-top'), true),
    //   right: this._strings.onlyNumbers(ctrl.css('border-right'), true),
    //   bottom: this._strings.onlyNumbers(ctrl.css('border-bottom'), true),
    //   left: this._strings.onlyNumbers(ctrl.css('border-left'), true),
    // };
    // dims.border.vertical = (dims.border.top || 0) + (dims.border.bottom || 0);
    // dims.border.horizontal = (dims.border.right || 0) + (dims.border.left || 0);
    //
    // dims.margin = {
    //   top: this._strings.onlyNumbers(ctrl.css('margin-top'), true),
    //   right: this._strings.onlyNumbers(ctrl.css('margin-right'), true),
    //   bottom: this._strings.onlyNumbers(ctrl.css('margin-bottom'), true),
    //   left: this._strings.onlyNumbers(ctrl.css('margin-left'), true),
    // };
    // dims.margin.vertical = (dims.margin.top || 0) + (dims.margin.bottom || 0);
    // dims.margin.horizontal = (dims.margin.right || 0) + (dims.margin.left || 0);
  };

  public getPaddings = (ctrl: any) => {
    ctrl = this._checkObj(ctrl);

    if (!ctrl) return {};

    return this._getPaddings(ctrl);
  };

  public getBorders = (ctrl: any) => {
    ctrl = this._checkObj(ctrl);

    if (!ctrl) return {};

    return this._getBorders(ctrl);
  };

  public getMargins = (ctrl: any) => {
    ctrl = this._checkObj(ctrl);

    if (!ctrl) return {};

    return this._getMargins(ctrl);
  };

  private _checkObj = (ctrl: any) => {
    try {
      if (!(ctrl instanceof $))
        ctrl = $(ctrl);
    }
    catch (err) {
      return null;
    }

    return ctrl;
  };

  private _getPaddings = (ctrl: any) => {
    let dims:any = {
      top: Number(this._strings.onlyNumbers(ctrl.css('padding-top'), true)),
      right: Number(this._strings.onlyNumbers(ctrl.css('padding-right'), true)),
      bottom: Number(this._strings.onlyNumbers(ctrl.css('padding-bottom'), true)),
      left: Number(this._strings.onlyNumbers(ctrl.css('padding-left'), true))
    };
    dims.vertical = (dims.top || 0) + (dims.bottom || 0);
    dims.horizontal = (dims.right || 0) + (dims.left || 0);

    return dims;
  };

  private _getBorders = (ctrl: any) => {
    let dims:any = {
      top: Number(this._strings.onlyNumbers(ctrl.css('border-top'), true)),
      right: Number(this._strings.onlyNumbers(ctrl.css('border-right'), true)),
      bottom: Number(this._strings.onlyNumbers(ctrl.css('border-bottom'), true)),
      left: Number(this._strings.onlyNumbers(ctrl.css('border-left'), true))
    };
    dims.vertical = (dims.top || 0) + (dims.bottom || 0);
    dims.horizontal = (dims.right || 0) + (dims.left || 0);

    return dims;
  };

  private _getMargins = (ctrl: any) => {
    let dims:any = {
      top: Number(this._strings.onlyNumbers(ctrl.css('margin-top'), true)),
      right: Number(this._strings.onlyNumbers(ctrl.css('margin-right'), true)),
      bottom: Number(this._strings.onlyNumbers(ctrl.css('margin-bottom'), true)),
      left: Number(this._strings.onlyNumbers(ctrl.css('margin-left'), true))
    };
    dims.vertical = (dims.top || 0) + (dims.bottom || 0);
    dims.horizontal = (dims.right || 0) + (dims.left || 0);

    return dims;
  };
}

class NumberHelpers {

  constructor(private _values: ValueHelpers,
              private _strings: StringHelpers) {
  }

  public condense(amt: number, decimals = 1) {
    if (amt < 0) {
      amt = amt * -1;
      return '(' + (amt >= 1.0e+9  // Nine Zeroes for Billions
        ? (amt / 1.0e+9).toFixed(decimals) + ')B'
        : amt >= 1.0e+6  // Six Zeroes for Millions
          ? (amt / 1.0e+6).toFixed(decimals) + ')M'
          : amt >= 1.0e+3  // Three Zeroes for Thousands
            ? (amt / 1.0e+3).toFixed(decimals) + ')K'
            : amt + ')');
    }
    else {
      return (amt >= 1.0e+9  // Nine Zeroes for Billions
        ? (amt / 1.0e+9).toFixed(decimals) + 'B'
        : amt >= 1.0e+6  // Six Zeroes for Millions
          ? (amt / 1.0e+6).toFixed(decimals) + 'M'
          : amt >= 1.0e+3  // Three Zeroes for Thousands
            ? (amt / 1.0e+3).toFixed(decimals) + 'K'
            : amt);
    }
  }

  public round(num: number, decimals: number) {
    let number = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    if (num - number > 0) {
      return (number + Math.floor(2 * Math.round((num - number) * Math.pow(10, (decimals + 1))) / 10) / Math.pow(10, decimals));
    } else {
      return number;
    }
  }

  public toCurrency(amt: number, decimals = 2, symbol?: string) {
    if (!amt) return '--';

    symbol = symbol || '$';

    let neg = amt < 0;
    if (neg) amt = amt * -1;

    let parts = amt.toString().split('.');

    let sLeft = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let sRight = parts.length < 2 ? '' : parts[1].toString();
    sRight = sRight.length < decimals ?
      this._strings.padRight(sRight, decimals, '0') :
      sRight.substr(0, decimals);

    let decimal = sRight && sRight.length ? '.' : '';

    if (neg)
      return `(${symbol}${sLeft}${decimal}${sRight})`;

    return `${symbol}${sLeft}${decimal}${sRight}`;
  }

  public toCondensedCurrency(amt: number, decimals = 1, symbol?: string) {
    return (symbol || '$') + this.condense(amt, decimals);
  }

  public toPercent(num: number, decimals = 2, isDecimal = true) {
    return (isDecimal ? (num * 100) : num).toFixed(decimals) + '%';
  }
}

class StringHelpers {

  constructor(private _values: ValueHelpers) {
  }

  public onlyNumbers(val: string, strict = false): string {
    strict = strict === true;

    let charAr = val.split(''),
      retVal = '';

    for (let i = 0; i < charAr.length; i++) {
      retVal += strict ? (_.indexOf(this._values.NUMBERS, charAr[i]) >= 0 ? charAr[i] : '') :
        (_.indexOf(this._values.NUMBERS, charAr[i]) >= 0 || charAr[i] === '.' ? charAr[i] : '');
    }

    charAr = null;
    return retVal;
  }

  public padLeft(val: string, length: number, padChar: string): string {
    padChar = padChar.length < 1 ? ' ' : padChar.length > 1 ? padChar[0] : padChar;
    while (val.length < length)
      val = padChar + val;
    return val;
  }

  public padRight(val: string, length: number, padChar: string): string {
    padChar = padChar.length < 1 ? ' ' : padChar.length > 1 ? padChar[0] : padChar;
    while (val.length < length)
      val = val + padChar;
    return val;
  }

  public removeWhitespace(val: string): string {
    while (val.indexOf('  ') >= 0) {
      val = val.replace('  ', ' ');
    }

    return val.trim();
  }

  public replaceAll(val: string, token: string | string[], newToken = '', ignoreCase = true): string {
    if (!token)
      return val;

    let caseVal = ignoreCase ? 'gi' : 'g';

    if (_.isArray(token)) {
      _.each(token, function (t, i) {
        val = val.replace(new RegExp(t, caseVal), newToken);
      });
      return val;
    }
    else if (typeof token === 'string')
      return val.replace(new RegExp(token, caseVal), newToken);
    else
      return val;
  }

  public toCurrency(val: string, decimals = 2, symbol?: string, isoCode?: string): string {
    symbol = symbol || '$';
    return symbol + this.toNumberWithCommas(val, decimals);
  }

  public toNumberWithCommas(val: string, decimals = 2): string {
    let parts = this.onlyNumbers(val).split('.');

    let sLeft = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let sRight = parts.length < 2 ? '' : parts[1].toString();
    sRight = sRight.length < 2 ?
      this.padRight(sRight, 2, '0') :
      sRight.substr(0, 2);

    return sLeft + '.' + sRight;
  }

  public toPhoneNumber(val: string, maxNumbers: number): string {
    let retVal = '(';
    let charAr = this.onlyNumbers(val).split('');

    maxNumbers = isNaN(maxNumbers) ? 15 : Number(maxNumbers);

    if (Number(maxNumbers) < 7 || Number(maxNumbers) > 15)
      maxNumbers = 15;

    for (let i = 0; i < charAr.length && i < maxNumbers; i++) {
      if (retVal.length === 14)
        retVal += ' x';

      retVal += charAr[i];

      if (retVal.length === 4)
        retVal += ') ';
      else if (retVal.length === 9)
        retVal += '-';
    }

    if (retVal === '(')
      retVal = '';

    return retVal;
  }
}

class ValueHelpers {

  public readonly NUMBERS: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  public readonly STATES: any[] = [
    {Abrev: 'AL', Name: 'Alabama'},
    {Abrev: 'AS', Name: 'American Samoa'},
    {Abrev: 'AZ', Name: 'Arizona'},
    {Abrev: 'AR', Name: 'Arkansas'},
    {Abrev: 'CA', Name: 'California'},
    {Abrev: 'CO', Name: 'Colorado'},
    {Abrev: 'CT', Name: 'Connecticut'},
    {Abrev: 'DE', Name: 'Delaware'},
    {Abrev: 'DC', Name: 'District Of Columbia'},
    {Abrev: 'FM', Name: 'Federated States Of Micronesia'},
    {Abrev: 'FL', Name: 'Florida'},
    {Abrev: 'GA', Name: 'Georgia'},
    {Abrev: 'GU', Name: 'Guam'},
    {Abrev: 'HI', Name: 'Hawaii'},
    {Abrev: 'ID', Name: 'Idaho'},
    {Abrev: 'IL', Name: 'Illinois'},
    {Abrev: 'IN', Name: 'Indiana'},
    {Abrev: 'IA', Name: 'Iowa'},
    {Abrev: 'KS', Name: 'Kansas'},
    {Abrev: 'KY', Name: 'Kentucky'},
    {Abrev: 'LA', Name: 'Louisiana'},
    {Abrev: 'ME', Name: 'Maine'},
    {Abrev: 'MH', Name: 'Marshall Islands'},
    {Abrev: 'MD', Name: 'Maryland'},
    {Abrev: 'MA', Name: 'Massachusetts'},
    {Abrev: 'MI', Name: 'Michigan'},
    {Abrev: 'MN', Name: 'Minnesota'},
    {Abrev: 'MS', Name: 'Mississippi'},
    {Abrev: 'MO', Name: 'Missouri'},
    {Abrev: 'MT', Name: 'Montana'},
    {Abrev: 'NE', Name: 'Nebraska'},
    {Abrev: 'NV', Name: 'Nevada'},
    {Abrev: 'NH', Name: 'New Hampshire'},
    {Abrev: 'NJ', Name: 'New Jersey'},
    {Abrev: 'NM', Name: 'New Mexico'},
    {Abrev: 'NY', Name: 'New York'},
    {Abrev: 'NC', Name: 'North Carolina'},
    {Abrev: 'ND', Name: 'North Dakota'},
    {Abrev: 'MP', Name: 'Northern Mariana Islands'},
    {Abrev: 'OH', Name: 'Ohio'},
    {Abrev: 'OK', Name: 'Oklahoma'},
    {Abrev: 'OR', Name: 'Oregon'},
    {Abrev: 'PW', Name: 'Palau'},
    {Abrev: 'PA', Name: 'Pennsylvania'},
    {Abrev: 'PR', Name: 'Puerto Rico'},
    {Abrev: 'RI', Name: 'Rhode Island'},
    {Abrev: 'SC', Name: 'South Carolina'},
    {Abrev: 'SD', Name: 'South Dakota'},
    {Abrev: 'TN', Name: 'Tennessee'},
    {Abrev: 'TX', Name: 'Texas'},
    {Abrev: 'UT', Name: 'Utah'},
    {Abrev: 'VT', Name: 'Vermont'},
    {Abrev: 'VI', Name: 'Virgin Islands'},
    {Abrev: 'VA', Name: 'Virginia'},
    {Abrev: 'WA', Name: 'Washington'},
    {Abrev: 'WV', Name: 'West Virginia'},
    {Abrev: 'WI', Name: 'Wisconsin'},
    {Abrev: 'WY', Name: 'Wyoming'}
  ];

  public readonly COUNTRIES: any[] = [
    {'Country': 'Afghanistan', 'IsoCode': 'AFN', 'HtmlHexCode': '&#x60b;'},
    {'Country': 'Albania', 'IsoCode': 'ALL', 'HtmlHexCode': ''},
    {'Country': 'Algeria', 'IsoCode': 'DZD', 'HtmlHexCode': ''},
    {'Country': 'Andorra', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Angola', 'IsoCode': 'AOA', 'HtmlHexCode': ''},
    {'Country': 'Antigua and Barbuda', 'IsoCode': 'XCD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Argentina', 'IsoCode': 'ARS', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Armenia', 'IsoCode': 'AMD', 'HtmlHexCode': ''},
    {'Country': 'Aruba', 'IsoCode': 'AWG', 'HtmlHexCode': ''},
    {'Country': 'Australia', 'IsoCode': 'AUD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Austria', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Azerbaijan', 'IsoCode': 'AZN', 'HtmlHexCode': ''},
    {'Country': 'Bahamas', 'IsoCode': 'BSD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Bahrain', 'IsoCode': 'BHD', 'HtmlHexCode': ''},
    {'Country': 'Bangladesh', 'IsoCode': 'BDT', 'HtmlHexCode': '&#x9f3;'},
    {'Country': 'Barbados', 'IsoCode': 'BBD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Belarus', 'IsoCode': 'BYR', 'HtmlHexCode': ''},
    {'Country': 'Belgium', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Belize', 'IsoCode': 'BZD', 'HtmlHexCode': ''},
    {'Country': 'Benin', 'IsoCode': 'XOF', 'HtmlHexCode': ''},
    {'Country': 'Bermuda', 'IsoCode': 'BMD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Bhutan', 'IsoCode': 'BTN', 'HtmlHexCode': ''},
    {'Country': 'Bolivia', 'IsoCode': 'BOB', 'HtmlHexCode': ''},
    {'Country': 'Bonaire', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Bosnia and Herzegovina', 'IsoCode': 'BAM', 'HtmlHexCode': ''},
    {'Country': 'Botswana', 'IsoCode': 'BWP', 'HtmlHexCode': ''},
    {'Country': 'Brazil', 'IsoCode': 'BRL', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'British Virgin Islands', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Brunei', 'IsoCode': 'BND', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Bulgaria', 'IsoCode': 'BGN', 'HtmlHexCode': ''},
    {'Country': 'Burkina Faso', 'IsoCode': 'XOF', 'HtmlHexCode': ''},
    {'Country': 'Burma', 'IsoCode': 'MMK', 'HtmlHexCode': ''},
    {'Country': 'Burundi', 'IsoCode': 'BIF', 'HtmlHexCode': ''},
    {'Country': 'Cambodia', 'IsoCode': 'KHR', 'HtmlHexCode': '&#x17db;'},
    {'Country': 'Cameroon', 'IsoCode': 'XAF', 'HtmlHexCode': ''},
    {'Country': 'Canada', 'IsoCode': 'CAD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Cape Verde', 'IsoCode': 'CVE', 'HtmlHexCode': ''},
    {'Country': 'Cayman Islands', 'IsoCode': 'KYD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Central African Republic', 'IsoCode': 'XAF', 'HtmlHexCode': ''},
    {'Country': 'Chad', 'IsoCode': 'XAF', 'HtmlHexCode': ''},
    {'Country': 'Chile', 'IsoCode': 'CLP', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'China, People’s Republic of', 'IsoCode': 'CNY', 'HtmlHexCode': '&#x00a5;'},
    {'Country': 'Cocos Islands', 'IsoCode': 'AUD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Colombia', 'IsoCode': 'COP', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Comoros', 'IsoCode': 'KMF', 'HtmlHexCode': ''},
    {'Country': 'Congo, Democratic Republic of', 'IsoCode': 'CDF', 'HtmlHexCode': ''},
    {'Country': 'Congo, Republic of the', 'IsoCode': 'XAF', 'HtmlHexCode': ''},
    {'Country': 'Cook Islands', 'IsoCode': 'NZD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Costa Rica', 'IsoCode': 'CRC', 'HtmlHexCode': '&#x20a1;'},
    {'Country': 'Côte d’Iviore', 'IsoCode': 'XOF', 'HtmlHexCode': ''},
    {'Country': 'Croatia', 'IsoCode': 'HRK', 'HtmlHexCode': ''},
    {'Country': 'Cuba', 'IsoCode': 'CUC', 'HtmlHexCode': '&#x20b1;'},
    {'Country': 'Curaçao', 'IsoCode': 'ANG', 'HtmlHexCode': ''},
    {'Country': 'Cyprus', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Czech Republic', 'IsoCode': 'CZK', 'HtmlHexCode': ''},
    {'Country': 'Denmark', 'IsoCode': 'DKK', 'HtmlHexCode': ''},
    {'Country': 'Djibouti', 'IsoCode': 'DJF', 'HtmlHexCode': ''},
    {'Country': 'Dominica', 'IsoCode': 'XCD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Dominican Republic', 'IsoCode': 'DOP', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'East Timor', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Ecuador', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Egypt', 'IsoCode': 'EGP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'El Salvador', 'IsoCode': 'SVC', 'HtmlHexCode': '&#x20a1;'},
    {'Country': 'Equatorial Guinea', 'IsoCode': 'XAF', 'HtmlHexCode': ''},
    {'Country': 'Eritrea', 'IsoCode': 'ERN', 'HtmlHexCode': ''},
    {'Country': 'Estonia', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Ethiopia', 'IsoCode': 'ETB', 'HtmlHexCode': ''},
    {'Country': 'Falkland Islands', 'IsoCode': 'FKP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'Fiji', 'IsoCode': 'FJD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Finland', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'France', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'French Polynesia', 'IsoCode': 'XPF', 'HtmlHexCode': ''},
    {'Country': 'Gabon', 'IsoCode': 'XAF', 'HtmlHexCode': ''},
    {'Country': 'Gambia', 'IsoCode': 'GMD', 'HtmlHexCode': ''},
    {'Country': 'Georgia', 'IsoCode': 'GEL', 'HtmlHexCode': ''},
    {'Country': 'Germany', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Ghana', 'IsoCode': 'GHS', 'HtmlHexCode': '&#x20b5;'},
    {'Country': 'Gibraltar', 'IsoCode': 'GIP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'Greece', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Grenada', 'IsoCode': 'XCD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Guatemala', 'IsoCode': 'GTQ', 'HtmlHexCode': ''},
    {'Country': 'Guernsey', 'IsoCode': 'GBP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'Guinea', 'IsoCode': 'GNF', 'HtmlHexCode': ''},
    {'Country': 'Guinea-Bissau', 'IsoCode': 'XOF', 'HtmlHexCode': ''},
    {'Country': 'Guyana', 'IsoCode': 'GYD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Haiti', 'IsoCode': 'HTG', 'HtmlHexCode': ''},
    {'Country': 'Honduras', 'IsoCode': 'HNL', 'HtmlHexCode': ''},
    {'Country': 'Hong Kong', 'IsoCode': 'HKD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Hungary', 'IsoCode': 'HUF', 'HtmlHexCode': ''},
    {'Country': 'Iceland', 'IsoCode': 'ISK', 'HtmlHexCode': ''},
    {'Country': 'India', 'IsoCode': 'INR', 'HtmlHexCode': '&#x20b9;'},
    {'Country': 'Indonesia', 'IsoCode': 'IDR', 'HtmlHexCode': ''},
    {'Country': 'Iran', 'IsoCode': 'IRR', 'HtmlHexCode': '&#xfdfc;'},
    {'Country': 'Iraq', 'IsoCode': 'IQD', 'HtmlHexCode': ''},
    {'Country': 'Ireland', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Isle of Man', 'IsoCode': 'GBP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'Israel', 'IsoCode': 'ILS', 'HtmlHexCode': '&#x20aa;'},
    {'Country': 'Italy', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Jamaica', 'IsoCode': 'JMD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Japan', 'IsoCode': 'JPY', 'HtmlHexCode': '&#x00a5;'},
    {'Country': 'Jersey', 'IsoCode': 'GBP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'Jordan', 'IsoCode': 'JOD', 'HtmlHexCode': ''},
    {'Country': 'Kazakhstan', 'IsoCode': 'KZT', 'HtmlHexCode': '&#x20b8;'},
    {'Country': 'Kenya', 'IsoCode': 'KES', 'HtmlHexCode': ''},
    {'Country': 'Korea, North', 'IsoCode': 'KPW', 'HtmlHexCode': '&#x20a9;'},
    {'Country': 'Korea, South', 'IsoCode': 'KPW', 'HtmlHexCode': '&#x20a9;'},
    {'Country': 'Kosovo', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Kuwait', 'IsoCode': 'KWD', 'HtmlHexCode': ''},
    {'Country': 'Kyrgyzstan', 'IsoCode': 'KGS', 'HtmlHexCode': ''},
    {'Country': 'Laos', 'IsoCode': 'LAK', 'HtmlHexCode': '&#x20ad;'},
    {'Country': 'Latvia', 'IsoCode': 'LVL', 'HtmlHexCode': ''},
    {'Country': 'Lebanon', 'IsoCode': 'LBP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'Lesotho', 'IsoCode': 'LSL', 'HtmlHexCode': ''},
    {'Country': 'Liberia', 'IsoCode': 'LRD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Libya', 'IsoCode': 'LD', 'HtmlHexCode': ''},
    {'Country': 'Liechtenstein', 'IsoCode': 'CHF', 'HtmlHexCode': ''},
    {'Country': 'Lithuania', 'IsoCode': 'LTL', 'HtmlHexCode': ''},
    {'Country': 'Luxembourg', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Macau', 'IsoCode': 'MOP', 'HtmlHexCode': ''},
    {'Country': 'Macedonia, Republic of', 'IsoCode': 'MKD', 'HtmlHexCode': ''},
    {'Country': 'Madagascar', 'IsoCode': 'MGA', 'HtmlHexCode': ''},
    {'Country': 'Malawi', 'IsoCode': 'MWK', 'HtmlHexCode': ''},
    {'Country': 'Malaysia', 'IsoCode': 'MYR', 'HtmlHexCode': ''},
    {'Country': 'Maldives', 'IsoCode': 'MVR', 'HtmlHexCode': ''},
    {'Country': 'Mali', 'IsoCode': 'XOF', 'HtmlHexCode': ''},
    {'Country': 'Malta', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Marshall Islands', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Mauritania', 'IsoCode': 'MRO', 'HtmlHexCode': ''},
    {'Country': 'Mauritius', 'IsoCode': 'MUR', 'HtmlHexCode': ''},
    {'Country': 'Mexico', 'IsoCode': 'MXN', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Micronesia', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Moldova', 'IsoCode': 'MDL', 'HtmlHexCode': ''},
    {'Country': 'Mongolia', 'IsoCode': 'MNT', 'HtmlHexCode': '&#x20ae;'},
    {'Country': 'Montenegro', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Montserrat', 'IsoCode': 'XCD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Morocco', 'IsoCode': 'MAD', 'HtmlHexCode': ''},
    {'Country': 'Mozambique', 'IsoCode': 'MZN', 'HtmlHexCode': ''},
    {'Country': 'Namibia', 'IsoCode': 'NAD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Nauru', 'IsoCode': 'AUD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Nepal', 'IsoCode': 'NPR', 'HtmlHexCode': ''},
    {'Country': 'Netherlands', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Netherlands Antilles', 'IsoCode': 'ANG', 'HtmlHexCode': ''},
    {'Country': 'New Caledonia', 'IsoCode': 'XPF', 'HtmlHexCode': ''},
    {'Country': 'New Zealand', 'IsoCode': 'NZD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Nicaragua', 'IsoCode': 'NIO', 'HtmlHexCode': ''},
    {'Country': 'Niger', 'IsoCode': 'XOF', 'HtmlHexCode': ''},
    {'Country': 'Nigeria', 'IsoCode': 'NGN', 'HtmlHexCode': '&#x20a6;'},
    {'Country': 'Niue', 'IsoCode': 'NZD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Norway', 'IsoCode': 'NOK', 'HtmlHexCode': ''},
    {'Country': 'Oman', 'IsoCode': 'OMR', 'HtmlHexCode': ''},
    {'Country': 'Pakistan', 'IsoCode': 'PKR', 'HtmlHexCode': ''},
    {'Country': 'Palau', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Panama', 'IsoCode': 'PAB', 'HtmlHexCode': ''},
    {'Country': 'Papua New Guinea', 'IsoCode': 'PGK', 'HtmlHexCode': ''},
    {'Country': 'Paraguay', 'IsoCode': 'PYG', 'HtmlHexCode': '&#x20b2;'},
    {'Country': 'Peru', 'IsoCode': 'PEN', 'HtmlHexCode': ''},
    {'Country': 'Philippines', 'IsoCode': 'PHP', 'HtmlHexCode': '&#x20b1;'},
    {'Country': 'Pitcairn Islands', 'IsoCode': 'NZD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Poland', 'IsoCode': 'PLN', 'HtmlHexCode': ''},
    {'Country': 'Portugal', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Qatar', 'IsoCode': 'QAR', 'HtmlHexCode': ''},
    {'Country': 'Romania', 'IsoCode': 'RON', 'HtmlHexCode': ''},
    {'Country': 'Russia', 'IsoCode': 'RUB', 'HtmlHexCode': ''},
    {'Country': 'Rwanda', 'IsoCode': 'RWF', 'HtmlHexCode': ''},
    {'Country': 'Saba', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Samoa', 'IsoCode': 'WST', 'HtmlHexCode': ''},
    {'Country': 'San Marino', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'São Tomé and Príncipe', 'IsoCode': 'STD', 'HtmlHexCode': ''},
    {'Country': 'Saudi Arabia', 'IsoCode': 'SAR', 'HtmlHexCode': ''},
    {'Country': 'Senegal', 'IsoCode': 'XOF', 'HtmlHexCode': ''},
    {'Country': 'Serbia', 'IsoCode': 'RSD', 'HtmlHexCode': ''},
    {'Country': 'Seychelles', 'IsoCode': 'SCR', 'HtmlHexCode': ''},
    {'Country': 'Sierra Leone', 'IsoCode': 'SLL', 'HtmlHexCode': ''},
    {'Country': 'Singapore', 'IsoCode': 'SGD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Slovakia', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Slovenia', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Solomon Islands', 'IsoCode': 'SBD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Somalia', 'IsoCode': 'SOS', 'HtmlHexCode': ''},
    {'Country': 'Somaliland', 'IsoCode': 'None', 'HtmlHexCode': ''},
    {'Country': 'South Africa', 'IsoCode': 'ZAR', 'HtmlHexCode': ''},
    {
      'Country': 'South Georgia/South Sandwich Islands',
      'IsoCode': 'GBP',
      'HtmlHexCode': '&#x00a3;'
    },
    {'Country': 'Spain', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Sri Lanka', 'IsoCode': 'LKR', 'HtmlHexCode': ''},
    {'Country': 'St. Helena', 'IsoCode': 'SHP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'St. Kitts and Nevis', 'IsoCode': 'XCD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'St. Lucia', 'IsoCode': 'XCD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'St. Vincent and the Grenadines', 'IsoCode': 'XCD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Sudan', 'IsoCode': 'SDG', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'Suriname', 'IsoCode': 'SRD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Swaziland', 'IsoCode': 'SZL', 'HtmlHexCode': ''},
    {'Country': 'Sweden', 'IsoCode': 'SEK', 'HtmlHexCode': ''},
    {'Country': 'Switzerland', 'IsoCode': 'CHF', 'HtmlHexCode': ''},
    {'Country': 'Syria', 'IsoCode': 'SYP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'Taiwan (Republic of China)', 'IsoCode': 'TWD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Tajikistan', 'IsoCode': 'TJS', 'HtmlHexCode': ''},
    {'Country': 'Tanzania', 'IsoCode': 'TZS', 'HtmlHexCode': ''},
    {'Country': 'Thailand', 'IsoCode': 'THB', 'HtmlHexCode': '&#x0e3f;'},
    {'Country': 'Togo', 'IsoCode': 'XOF', 'HtmlHexCode': ''},
    {'Country': 'Tonga', 'IsoCode': 'TOP', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Trinidad and Tobago', 'IsoCode': 'TTD', 'HtmlHexCode': '&#36;'},
    {'Country': 'Tunisia', 'IsoCode': 'TND', 'HtmlHexCode': ''},
    {'Country': 'Turkey', 'IsoCode': 'TRY', 'HtmlHexCode': ''},
    {'Country': 'Turkmenistan', 'IsoCode': 'TMT', 'HtmlHexCode': ''},
    {'Country': 'Turks and Caicos Islands', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Tuvalu', 'IsoCode': 'AUD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Uganda', 'IsoCode': 'UGX', 'HtmlHexCode': ''},
    {'Country': 'Ukraine', 'IsoCode': 'UAH', 'HtmlHexCode': '&#x20b4;'},
    {'Country': 'United Arab Emirates', 'IsoCode': 'AED', 'HtmlHexCode': ''},
    {'Country': 'United Kingdom', 'IsoCode': 'GBP', 'HtmlHexCode': '&#x00a3;'},
    {'Country': 'United States', 'IsoCode': 'USD', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Uruguay', 'IsoCode': 'UYU', 'HtmlHexCode': '&#x0024;'},
    {'Country': 'Uzbekistan', 'IsoCode': 'UZS', 'HtmlHexCode': ''},
    {'Country': 'Vanuatu', 'IsoCode': 'VUV', 'HtmlHexCode': ''},
    {'Country': 'Vatican City', 'IsoCode': 'EUR', 'HtmlHexCode': '&#x20ac;'},
    {'Country': 'Venezuela', 'IsoCode': 'VEF', 'HtmlHexCode': ''},
    {'Country': 'Vietnam', 'IsoCode': 'VND', 'HtmlHexCode': '&#x20ab;'},
    {'Country': 'Wallis and Futuna', 'IsoCode': 'XPF', 'HtmlHexCode': ''},
    {'Country': 'Yemen', 'IsoCode': 'YER', 'HtmlHexCode': '&#xfdfc;'},
    {'Country': 'Zambia', 'IsoCode': 'ZMK', 'HtmlHexCode': ''},
    {'Country': 'Zimbabwe', 'IsoCode': 'ZWL', 'HtmlHexCode': '&#x0024;'}];

  constructor() {
  }

  //public getCountryByIsoCode = (code: string) => {
  //  return _.find(this.COUNTRIES, {IsoCode: code}) || {HtmlHexCode: ''};
  //};
}


