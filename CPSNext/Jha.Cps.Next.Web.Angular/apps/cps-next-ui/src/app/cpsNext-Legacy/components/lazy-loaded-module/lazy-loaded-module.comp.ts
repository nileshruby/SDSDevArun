import {Component, ViewEncapsulation} from '@angular/core';
import {LoggingService} from '@app/services';

@Component({
  selector: 'module-wrapper',
  encapsulation: ViewEncapsulation.None,
  styles: [``],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `
})

export class LazyLoadedModuleComponent {
  protected readonly CLASSNAME = 'LazyLoadedModuleComponent';

  constructor(private _log: LoggingService) {
  }
}
