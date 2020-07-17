import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'loading-anim',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./loading-anim.scss'],
  template: `
  <div class="spinner">
    <div class="rect1"></div>
    <div class="rect2"></div>
    <div class="rect3"></div>
    <div class="rect4"></div>
    <div class="rect5"></div>
  </div>
  `
})

export class LoadingAnimComponent {
  protected readonly CLASSNAME = 'LoadingAnimComponent';

  constructor() {
  }
}

