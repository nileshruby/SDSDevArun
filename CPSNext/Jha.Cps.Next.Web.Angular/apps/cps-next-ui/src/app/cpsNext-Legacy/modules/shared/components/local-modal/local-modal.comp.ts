import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewEncapsulation, ViewChildren, QueryList} from '@angular/core';

import {HelpersService, LoggingService} from '@app/services';

import * as $ from 'jquery';
import { Subscription } from 'rxjs';

@Component({
  selector: 'local-modal',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./local-modal.scss'],
  template: `
    <div #wrapper class="local-modal" *ngIf="isOpen" [ngStyle]="wrapperStyle">
      <div class="modal-overlay" *ngIf="showOverlay"></div>
      <div #modalBody class="modal-body" [ngStyle]="bodyStyle">
        <ng-content #header select="header"></ng-content>
        <ng-content #main select="main"></ng-content>
        <ng-content #footer select="footer"></ng-content>
      </div>
    </div>
  `
})

export class LocalModalComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = 'LocalModalComponent';

  private readonly _classes = {
    open: 'modal-open',
    closed: 'modal-closed'
  };

  @Input() target: ElementRef;

  @Input() height = '300';
  @Input() width = '300';
  @Input() showOverlay = true;

 
  @ViewChildren("wrapper")
  wrapperQuery: QueryList<HTMLDivElement>;
  wrapperQuerySubscription: Subscription;
  wrapper: HTMLDivElement;

  @ViewChildren("modalBody")
  modalBodyQuery: QueryList<ElementRef>;
  modalBodyQuerySubscription: Subscription;
  modalBody: ElementRef;

  public get isOpen() {
    return this._isOpen;
  }

  public get wrapperStyle() {
    return {
      height: this._layout.wrapper.height + 'px',
      left: this._layout.wrapper.position.left + 'px',
      top: this._layout.wrapper.position.top + 'px',
      width: this._layout.wrapper.width + 'px'
    };
  }

  public get bodyStyle() {
    return {
      height: this._layout.modal.height + 'px',
      left: this._layout.modal.position.left + 'px',
      top: this._layout.modal.position.top + 60+ 'px',
      width: this._layout.modal.width + 'px'
    };
  }

  private _layout = {
    wrapper: {
      height: 300,
      width: 300,
      position: {
        left: 0,
        top: 0
      }
    },
    modal: {
      height: 300,
      width: 300,
      position: {
        left: 0,
        top: 0
      }
    }
  };

  private _isOpen = false;

  constructor(private _elem: ElementRef,
              private _helpers: HelpersService,
              private _log: LoggingService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.wrapperQuerySubscription = this.wrapperQuery.changes.subscribe(
      (ql: QueryList<HTMLDivElement>) => {
        this.wrapper = ql.first;
        this.wrapperQuerySubscription.unsubscribe();
      }
    );

    this.modalBodyQuerySubscription = this.modalBodyQuery.changes.subscribe(
      (bodyql: QueryList<ElementRef>) => {
        this.modalBody = bodyql.first;
        this.modalBodyQuerySubscription.unsubscribe();
      }
    );
  }

  ngOnDestroy(): void {
    this.wrapperQuerySubscription.unsubscribe();
    this.modalBodyQuerySubscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  public onWindowResize($event): void {
    if (this.isOpen) {
      this._setWrapperDimensions();
      this._setContentDimensions();
    }
  }


  public open = (): void => {
    // this._log.debug(`${this.CLASSNAME} > open()`);

    if (this._isOpen !== true) {
      this._isOpen = true;
      this._setWrapperDimensions();
      setTimeout(this._setContentDimensions.bind(this), 100);
    }
  };

  public close(): void {
    this._isOpen = false;
  }


  private _setWrapperDimensions = () => {
    if(!this.isOpen) return;

    // let layout = this._getTargetLayout();
    const elem:any = document.querySelector('.main-wrapper');
    // let elem = document.querySelector(); //this.target.nativeElement ? this.target.nativeElement : this.target;
    if(!elem){
      this._log.error(`${this.CLASSNAME} > _setWrapperDimensions() [E]: Invalid target element.`);
      return;
    }

    // WRAPPER
    this._layout.wrapper.height = elem.clientHeight;
    this._layout.wrapper.width = elem.clientWidth-77;
    this._layout.wrapper.position.left = 15;
    this._layout.wrapper.position.top = 10;


    let width = 0,
      height = 0;
    // MODAL
    if (this.width) {
      if (this.width.indexOf('%') >= 0) {
        let percent = Number(this._helpers.strings.onlyNumbers(this.width)) / 100;
        width = elem.clientWidth * percent;
      }
      else {
        width = Number(this._helpers.strings.onlyNumbers(this.width));
      }
    }

    if (this.height) {
      if (this.height.indexOf('%') >= 0) {
        let percent = Number(this._helpers.strings.onlyNumbers(this.height)) / 100;
        height = elem.clientHeight * percent;
      }
      else {
        height = Number(this._helpers.strings.onlyNumbers(this.height));
      }
    }

    this._layout.modal.width = width;
    this._layout.modal.height = height-100;
    this._layout.modal.position.left = ((elem.clientWidth - width) / 2) - 34;
  };

  private _setContentDimensions = () => {
    if(!this.isOpen) return;

    let header = this._getHeader(),
      $main = $(this._getMain()),
      footer = this._getFooter(),
      dims = this._helpers.doms.getDimensions($main);

    if(!header){
      this._log.error(`${this.CLASSNAME} > _setContentDimensions() [E]: Invalid header element.`);
      return;
    }

    if(!$main){
      this._log.error(`${this.CLASSNAME} > _setContentDimensions() [E]: Invalid main element.`);
      return;
    }

    if(!footer){
      this._log.error(`${this.CLASSNAME} > _setContentDimensions() [E]: Invalid footer element.`);
      return;
    }

    $main.height(this._layout.modal.height -
      (header.clientHeight || 0) -
      (footer.clientHeight || 0) -
      dims.padding.vertical -
      dims.border.vertical -
      dims.margin.vertical);
  };

  private _getTargetLayout = () => {
    let elem = this.target.nativeElement;

    if (elem && elem.getBoundingClientRect) {
      let rect = elem.getBoundingClientRect();

      if (rect.width || rect.height || elem.getClientRects().length) {
        let doc = elem.ownerDocument,
          docElem = doc.documentElement;

        return {
          height: elem.clientHeight,
          width: elem.clientWidth,
          offset: {
            top: rect.top + window.pageYOffset - docElem.clientTop,
            left: rect.left + window.pageXOffset - docElem.clientLeft
          }
        };
      }
    }
  };

  private _getHeader() {
    try {
      for (let i = 0; i < this.modalBody.nativeElement.children.length; i++) {
        if (this.modalBody.nativeElement.children[i].tagName.toLowerCase() === 'header')
          return this.modalBody.nativeElement.children[i];
      }
    }
    catch (err) {
    }

    return null;
  }

  private _getMain() {
    try {
      for (let i = 0; i < this.modalBody.nativeElement.children.length; i++) {
        if (this.modalBody.nativeElement.children[i].tagName.toLowerCase() === 'main')
          return this.modalBody.nativeElement.children[i];
      }
    }
    catch (err) {
    }

    return null;
  }

  private _getFooter() {
    try {
      for (let i = 0; i < this.modalBody.nativeElement.children.length; i++) {
        if (this.modalBody.nativeElement.children[i].tagName.toLowerCase() === 'footer')
          return this.modalBody.nativeElement.children[i];
      }
    }
    catch (err) {
    }

    return null;
  }
}
