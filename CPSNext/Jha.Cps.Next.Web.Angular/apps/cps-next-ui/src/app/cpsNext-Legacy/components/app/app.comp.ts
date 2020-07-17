import {Component, OnInit} from '@angular/core';
import {LoggingService, NavigationService} from '@app/services';
import {APP_KEYS} from '@entities/app-keys';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: []
})

export class AppComponent implements OnInit {
  protected readonly CLASSNAME = 'AppComponent';

  constructor(private _navSvc: NavigationService,
              private _log: LoggingService) {
  }

  ngOnInit() {
    // this._log.debug(`${this.CLASSNAME} > ngOnInit()`);

    //TODO: Add back when dynamic routing is working
      // this._navSvc.setupProductRouting();
  }
}
