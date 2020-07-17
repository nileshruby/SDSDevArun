import {IButton} from '@entities/html-controls.t';

export enum DialogTypes {
  Decision = 1,
  Notification = 2,
  OkCancel = 3,
  YesNo = 4
}

export class DialogConfig {
  public dialogType: DialogTypes = null;
  public dialogClass = '';
  public title = '';
  public text = '';
  public htmlBody = '';
  public bodyClass = '';
  public panelWidth = 0;
  public panelHeight = 0;

  okButtonText = '';
  okButtonCallback = null;

  cancelButtonText = '';
  cancelButtonCallback = null;

  public buttons: IButton[] = [];
}
