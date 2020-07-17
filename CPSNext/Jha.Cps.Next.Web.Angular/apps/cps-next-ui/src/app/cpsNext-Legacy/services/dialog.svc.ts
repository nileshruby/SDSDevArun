import {Injectable} from '@angular/core';

import {LoggingService} from './logging.svc';

@Injectable()
export class DialogService {
  protected readonly CLASSNAME = 'DialogService';

  private _dialog: any;

  constructor(private _log: LoggingService) {
    // this._log.debug(`${this.CLASSNAME} > constructor()`);
  }

  public registerDialog(dialog: any) {
    // this._log.debug(`${this.CLASSNAME} > registerDialog()`);

    if (this._dialog)
      this._log.error(`${this.CLASSNAME} > registerDialog() > Error: Dialog already registered.  Only one dialog allowed per instance`);
    else if (dialog && dialog.show && dialog.hide)
      this._dialog = dialog;
  }

  public show(config: any) {
    // this._log.debug(`${this.CLASSNAME} > show()`);
    if (this._dialog && this._dialog.show)
      this._dialog.show(config);
    else
      this._log.error(`${this.CLASSNAME} > show() > Error: No dialog instance`);
  }

  public hide() {
    // this._log.debug(`${this.CLASSNAME} > hide()`);
    if (this._dialog && this._dialog.hide)
      this._dialog.hide();
    else
      this._log.error(`${this.CLASSNAME} > show() > Error: No dialog instance`);
  }
}
