import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-footer',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app-footer.scss'],
  template: `
    <div class="container-fluid app-footer">
      © {{year}} Jack Henry Software, Authorized Use Only
    </div>
  `
})
export class AppFooterComponent {
  protected readonly CLASSNAME = 'AppFooterComponent';
  year: number = new Date().getFullYear();
  constructor() {
  }
}
