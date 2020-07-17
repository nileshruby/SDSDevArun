import { Component, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'cm-versions',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./version.scss'],
  templateUrl: './version.html'
})

export class VersionComponent implements OnChanges {
  protected readonly CLASSNAME = 'VersionComponent';
  @Input() productId;
  constructor() { }
  ngOnChanges() {}
}
