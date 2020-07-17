import {Component, Input, ViewEncapsulation} from '@angular/core';

import {LoggingService} from '@app/services';
import {INavMenuItem} from '@entities/nav-menu.i';

@Component({
  selector: 'module-nav-item',
  encapsulation: ViewEncapsulation.None,
  styles: [''],
  template: `
    <li class="module-nav-item" *ngIf="item">
      <label *ngIf="item.isSection">
        <i class="fa fa-object-group fa-lg" aria-hidden="true"></i>
        {{isCollapsed ? '' : item.text}}

        <module-nav-item-tooltip [text]="item.text" *ngIf="isCollapsed"></module-nav-item-tooltip>
      </label>
      
      <a *ngIf="!item.isSection" routerLink="/{{item.value}}">
        {{isCollapsed ? '' : item.text}}

        <module-nav-item-tooltip [text]="item.text" *ngIf="isCollapsed"></module-nav-item-tooltip>
      </a>

      <ul class="nav-items" *ngIf="item.children && item.children.length">
        <module-nav-item
          *ngFor="let child of item.children"
          [item]="child" 
          [isCollapsed]="isCollapsed">
        </module-nav-item>
      </ul>
    </li>
  `
})

export class ModuleNavItemComponent {
  protected readonly CLASSNAME = 'ModuleNavItemComponent';

  @Input() item: INavMenuItem;
  @Input() isCollapsed: boolean;

  constructor(private _log: LoggingService) {
    this.isCollapsed = false;
  }
}
