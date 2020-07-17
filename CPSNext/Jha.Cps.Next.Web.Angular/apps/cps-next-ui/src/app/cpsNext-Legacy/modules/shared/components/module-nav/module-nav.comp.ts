import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {LoggingService, SessionService} from '@app/services';
import {INavMenuConfig, INavMenuItem} from '@entities/nav-menu.i';
import {APP_KEYS} from '@entities/app-keys';
import { UserContext } from '@app/entities/user-context';

@Component({
  selector: 'module-nav',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './module-nav.html',
  styleUrls: ['./module-nav.scss']
})

export class ModuleNavComponent implements OnInit {
  protected readonly CLASSNAME = 'ModuleNavComponent';

  @Output() onCollapse = new EventEmitter<boolean>();

  public config: INavMenuConfig = null;

  public navCollapsed = false;
  public moduleNavClasses = {};
  public toggleBtnIconClasses = {};
  public userContext: UserContext;
  private _classes = {
    mainNavOpen: 'nav-open',
    mainNavCollapsed: 'nav-collapsed',
    toggleBtnOpen: 'fa-caret-left',
    toggleBtnCollapsed: 'fa-caret-right',
  };

  constructor(private _sessionSvc: SessionService,
              private _log: LoggingService) {
    this._sessionSvc.onUpdate(APP_KEYS.ModuleNavConfig)
      .subscribe(this._handleConfig);
  }

  ngOnInit() {
    this._setClasses();
  }

  public toggleNavCollapse($event: any) {
    this.navCollapsed = !this.navCollapsed;
    this._setClasses();

    this.onCollapse.emit(this.navCollapsed);
  }

  private _handleConfig = (config: INavMenuConfig) => {
    if (!config || !config.title) {
      return;
    }
    config.items = config.items || [];
    this.config = config;
  };

  private _setClasses = () => {
      this.moduleNavClasses[this._classes.mainNavCollapsed] = this.navCollapsed;
      this.moduleNavClasses[this._classes.mainNavOpen] = !this.navCollapsed;
      this.toggleBtnIconClasses[this._classes.toggleBtnCollapsed] = this.navCollapsed;
      this.toggleBtnIconClasses[this._classes.toggleBtnOpen] = !this.navCollapsed;
  };
}
