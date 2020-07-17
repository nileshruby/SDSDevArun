import {Component, Input, OnInit, OnDestroy, HostListener, AfterViewInit, ViewChildren, QueryList} from '@angular/core';

import {HelpersService, LoggingService, ModalService} from '@app/services';
import { Subscription } from 'rxjs';


@Component({
  selector: 'modal',
  styleUrls: ['./modal.scss'],
  template: `
    <div #wrapper class="modal" *ngIf="showModal">
      <div class="modal-overlay" *ngIf="showOverlay"></div>
      <div #modalBody class="modal-body" 
           [style.bottom.px]="layout.position.bottom"
           [style.left.px]="layout.position.left"
           [style.right.px]="layout.position.right"
           [style.top.px]="layout.position.top">
        <ng-content select="header"></ng-content>
        <ng-content select="main"></ng-content>
        <ng-content select="footer"></ng-content>
      </div>
    </div>
  `
})

export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = 'ModalComponent';

  private readonly _classes = {
    open: 'modal-open',
    closed: 'modal-closed'
  };

  @Input() name: string = null;

  @Input() height = '300';
  @Input() width = '300';
  @Input() showOverlay = true;

  
  @ViewChildren("wrapper")
  wrapperQuery: QueryList<HTMLDivElement>;
  wrapperQuerySubscription: Subscription;
  wrapper: HTMLDivElement;

  @ViewChildren("modalBody")
  modalBodyQuery: QueryList<HTMLDivElement>;
  modalBodyQuerySubscription: Subscription;
  modalBody: HTMLDivElement;

  public showModal = false;
  public layout = {
    height: 300,
    width: 300,
    position: {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0
    }
  };

  constructor(private _modalSvc: ModalService,
              private _helpers: HelpersService,
              private _log: LoggingService) {
  }

  ngOnInit(): void {
    if (!this.name) {
      this._log.debug(`${this.CLASSNAME} > Error: Modal missing name.`);
      return;
    }

    this._modalSvc.add(this);
  }

  ngAfterViewInit(): void {
    this.wrapperQuerySubscription = this.wrapperQuery.changes.subscribe(
      (ql: QueryList<HTMLDivElement>) => {
        this.wrapper = ql.first;
        this.wrapperQuerySubscription.unsubscribe();
        this._setPosition();
      }
    );

    this.modalBodyQuerySubscription = this.modalBodyQuery.changes.subscribe(
      (ql: QueryList<HTMLDivElement>) => {
        this.modalBody = ql.first;
        this.modalBodyQuerySubscription.unsubscribe();
        this._setPosition();
      }
    );
  }

  ngOnDestroy(): void {
    this._modalSvc.remove(this.name);
    this.wrapperQuerySubscription.unsubscribe();
    this.modalBodyQuerySubscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  public onWindowResize($event): void {
    this._setPosition();
  }


  public open = (): void => {
    if (this.showModal !== true)
      this.showModal = true;
  };

  public close(): void {
    if (this.showModal)
      this.showModal = false;
  }


  private _setPosition = () => {
    if (this.width) {
      if (this.width.indexOf('%') >= 0) {
        let percent = Number(this._helpers.strings.onlyNumbers(this.width)) / 100;
        this.layout.width = window.innerWidth * percent;
      }
      else
        this.layout.width = Number(this._helpers.strings.onlyNumbers(this.width));
    }

    if (this.height) {
      if (this.height.indexOf('%') >= 0) {
        let percent = Number(this._helpers.strings.onlyNumbers(this.height)) / 100;
        this.layout.height = window.innerHeight * percent;
      }
      else
        this.layout.height = Number(this._helpers.strings.onlyNumbers(this.height));
    }

    this.layout.position.left = this.layout.position.right = ((window.innerWidth - this.layout.width) / 2);
    this.layout.position.bottom = this.layout.position.top = ((window.innerHeight - this.layout.height) / 2);
  };
}
