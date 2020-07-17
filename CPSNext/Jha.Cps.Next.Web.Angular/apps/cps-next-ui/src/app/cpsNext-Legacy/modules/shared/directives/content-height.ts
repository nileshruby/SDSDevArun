/**
 * Created by Chris Reed on 2/15/2017.
 */

import {AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';

import {LoggingService} from '@app/services';

import * as $ from 'jquery';
import {ResizeObserver} from '@node_modules/resize-observer';

@Directive({selector: '[contentHeight]'})

export class ContentHeightDirective implements AfterViewInit {
  protected readonly CLASSNAME = 'ContentHeightDirective';

  @Input() contentHeight = '';

  @Output() resize = new EventEmitter<number>();

  constructor(private _elem: ElementRef,
              private _log: LoggingService) {
  }

  @HostListener('window:resize', ['$event']) onResize(event) {
    // this._log.trace(`ContentHeightDirective > window:resize`);
    setTimeout(this._setDimensions, 10);
  }

  @HostListener('load', ['$event']) onLoad(event) {
    // this._log.trace(`ContentHeightDirective > load`);
    setTimeout(this._setDimensions, 10);
  }

  ngAfterViewInit(): void {
    let $this = $(this._elem.nativeElement),
      $target = $(this.contentHeight).first();

    if (!$target || !$target.length)
      $target = $this.parent();

    if ($target && $target.length) {
      // this._log.debug(`${this.CLASSNAME} > contentHeight() > $target: `, $target[0]);
      let ro = new ResizeObserver(this._setDimensions);
      ro.observe($target[0]);
    }

    // Set timeout to evaluate post template render
    setTimeout(this._setDimensions, 10);
  }

  private _setDimensions = () => {
    let $this = $(this._elem.nativeElement),
      $siblings = $this.siblings(),
      $target = $(this.contentHeight).first();

    if (!$target || !$target.length)
      $target = $this.parent();

    let cHeight = $target.innerHeight();

    if ($siblings && $siblings.length) {
      $siblings.each((i: number, sibling: any) => {
        // this._log.debug(`${this.CLASSNAME} > _setDimensions() > sibling.clientHeight: `, sibling.clientHeight);

        let dims = this._getElemDimensions(sibling);
        cHeight -= dims.outerHeight;

        // this._log.debug(`${this.CLASSNAME} > _setDimensions > cHeight: ${cHeight}:`, sibling, dims);
      });
    }

    // this._log.debug(`ContentHeightDirective > _setDimensions > $target.height`, $target.height());
    // this._log.debug(`${this.CLASSNAME} > _setDimensions > cHeight`, cHeight);

    let thisDims = this._getElemDimensions(this._elem.nativeElement);
    $this.height(cHeight - thisDims.marginTop - thisDims.marginBottom);

    this.resize.emit(cHeight);
  };

  private _getElemDimensions = (elem: HTMLElement): any => {
    return {
      height: elem.offsetHeight,
      outerHeight: (elem.offsetHeight + elem.style.marginBottom + elem.style.marginTop),
      marginBottom: elem.style.marginBottom,
      marginTop: elem.style.marginTop
    };
  };
}
