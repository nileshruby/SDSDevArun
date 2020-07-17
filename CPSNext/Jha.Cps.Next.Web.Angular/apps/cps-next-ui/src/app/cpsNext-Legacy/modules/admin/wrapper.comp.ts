import {Component, OnInit, ViewEncapsulation} from '@angular/core';

import {LoggingService, SessionService} from '@app/services';
import {APP_KEYS} from '@entities/app-keys';
import {INavMenuConfig, INavMenuItem} from '@entities/nav-menu.i';
import {ModuleWrapperComponent} from '@shared/components/module-wrapper/module-wrapper.comp';

@Component({
  selector: 'global-admin',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./admin.scss'],
  template: `
    <div #pageWrapper class="container-fluid page-wrapper">
      <div #mainWrapper class="main-wrapper pull-right" [ngClass]="mainWrapperClasses">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})

export class GA_WrapperComponent extends ModuleWrapperComponent implements OnInit {
  protected readonly CLASSNAME = 'GA_WrapperComponent';

  constructor(logger: LoggingService,
              private _sessionSvc: SessionService) {
    super(logger);
  }

  ngOnInit() {
    this._sessionSvc.set(APP_KEYS.ModuleNavConfig, null);
    this.mainWrapperClasses = 'no-nav';
  }
}
