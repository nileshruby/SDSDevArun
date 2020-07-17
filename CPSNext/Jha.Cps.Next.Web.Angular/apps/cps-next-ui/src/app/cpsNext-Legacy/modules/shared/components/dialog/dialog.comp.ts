import {AfterViewInit, Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';

import {DialogService, HelpersService, LoggingService} from '@app/services';
import {DialogConfig, DialogTypes} from '@entities/dialog';

import * as $ from 'jquery';

@Component({
  selector: 'dialog-modal',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./dialog.scss'],
  templateUrl: './dialog.html'
})

export class DialogComponent implements OnInit, AfterViewInit {
  protected readonly CLASSNAME = 'DialogComponent';

  private readonly _classes = {
    open: 'modal-open',
    closed: 'modal-closed'
  };

  public get showDialog() {
    return this._showDialog;
  }

  public get config() {
    return this._cfg;
  }

  public layout = {
    bodyHeight: '',
    bodyWidth: '',
    pos: {
      left: '',
      right: '',
      top: ''
    }
  };

  private _showDialog = false;
  private _cfg: DialogConfig = null;

  constructor(private _dialogSvc: DialogService,
              private _helpers: HelpersService,
              private _log: LoggingService) {
  }

  ngOnInit(): void {
    this._dialogSvc.registerDialog(this);
  }

  ngAfterViewInit(): void {
    // this._setPosition();
  }

  @HostListener('window:resize', ['$event'])
  public onWindowResize($event): void {
    this._setPosition();
  }

  public okClick() {
    if (this._cfg.okButtonCallback)
      this._cfg.okButtonCallback();

    this.hide();
  }

  public cancelClick() {
    if (this._cfg.cancelButtonCallback)
      this._cfg.cancelButtonCallback();

    this.hide();
  }

  public show = (config: DialogConfig): void => {
    // this._log.debug(`${this.CLASSNAME} > show()`);

    if (this._showDialog !== true && config) {
      this._cfg = config;
      this._showDialog = true;
      this._setPosition();
    }
  };

  public hide(): void {
    // this._log.debug(`${this.CLASSNAME} > hide()`);
    if (this._showDialog)
      this._showDialog = false;
  }


  private _setPosition = () => {
    if (!this._cfg)
      return;

    let cfg = this._cfg,
      $dialog = $('dialog'),
      $overlay = $dialog.children('.dialog-overlay').eq(0),
      $body = $dialog.children('.dialog-body').eq(0);

    switch (cfg.dialogType) {
      case DialogTypes.Decision:
        break;
      case DialogTypes.Notification:
        break;
      case DialogTypes.OkCancel:
        this.layout.bodyHeight = '100px';
        this.layout.pos.top = '400px';
        break;
      case DialogTypes.YesNo:
        this.layout.bodyHeight = '100px';
        this.layout.bodyWidth = '300px';
        this.layout.pos.top = (($overlay.height() - 100) / 2) + 'px';
        break;
    }


    // if (this.width) {
    //   if (this.width.indexOf('%') >= 0) {
    //     let percent = Number(this._helpers.strings.onlyNumbers(this.width)) / 100;
    //     this.layout.width = window.innerWidth * percent;
    //   }
    //   else
    //     this.layout.width = Number(this._helpers.strings.onlyNumbers(this.width));
    // }
    //
    // if (this.height) {
    //   if (this.height.indexOf('%') >= 0) {
    //     let percent = Number(this._helpers.strings.onlyNumbers(this.height)) / 100;
    //     this.layout.height = window.innerHeight * percent;
    //   }
    //   else
    //     this.layout.height = Number(this._helpers.strings.onlyNumbers(this.height));
    // }
    //
    // this.layout.position.left = this.layout.position.right = ((window.innerWidth - this.layout.width) / 2);
    // this.layout.position.bottom = this.layout.position.top = ((window.innerHeight - this.layout.height) / 2);
  };
}
