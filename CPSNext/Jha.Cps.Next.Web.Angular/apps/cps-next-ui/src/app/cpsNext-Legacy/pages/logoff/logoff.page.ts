import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {AccountService, DialogService} from '@app/services';

@Component({
  selector: 'login-page',
  encapsulation: ViewEncapsulation.None,
  template: '',
  styles: [``]
})

export class LogoffPage {
  protected readonly CLASSNAME = 'LogoffPage';

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _dialogSvc: DialogService,
              private _accountSvc: AccountService) {
    this._route.queryParams.subscribe(params => {
      this._dialogSvc.hide();
      this._accountSvc.logoff();
      this._router.navigate(['/login'], {queryParams: params || {}});
    });
  }
}
