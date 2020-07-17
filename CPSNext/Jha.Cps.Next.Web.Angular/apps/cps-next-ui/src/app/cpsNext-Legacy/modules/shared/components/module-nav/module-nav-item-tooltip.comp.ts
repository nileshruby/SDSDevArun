import {Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'module-nav-item-tooltip',
  encapsulation: ViewEncapsulation.None,
  styles: [``],
  template: `
    <div class="module-nav-item-tooltip">
      <div></div>
      <label>{{text}}</label>
    </div>
  `
})

export class ModuleNavItemTooltipComponent {
  protected readonly CLASSNAME = 'ModuleNavItemTooltipComponent';

  @Input() text: string;

  constructor() {
  }
}
