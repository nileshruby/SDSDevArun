import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewEncapsulation,
  ViewChildren,
  OnDestroy,
  QueryList
} from "@angular/core";

import { LoggingService } from "@app/services";

import * as $ from "jquery";
import { Subscription } from "rxjs";

@Component({
  selector: "module-wrapper",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./module-wrapper.html",
  styles: [``]
})
export class ModuleWrapperComponent implements AfterViewInit, OnDestroy {
  protected readonly BASE_CLASSNAME = "ModuleWrapperComponent";

  @ViewChildren("pageWrapper")
  pageWrapperQuery: QueryList<ElementRef>;
  pageWrapperQuerySubscription: Subscription;
  pageWrapper: ElementRef;

  @ViewChildren("mainWrapper")
  mainWrapperQuery: QueryList<ElementRef>;
  mainWrapperQuerySubscription: Subscription;
  mainWrapper: ElementRef;

  public mainWrapperClasses = {};

  constructor(protected log: LoggingService) {}

  @HostListener("window:resize", ["$event"]) onResize(event) {
    this._setDimensions();
  }

  @HostListener("load", ["$event"]) onLoad(event) {
    this._setDimensions();
  }

  ngAfterViewInit(): void {
    this.pageWrapperQuerySubscription = this.pageWrapperQuery.changes.subscribe(
      (ql: QueryList<ElementRef>) => {
        this.pageWrapper = ql.first;
        this.pageWrapperQuerySubscription.unsubscribe();
        this._setDimensions;
      }
    );

    this.mainWrapperQuerySubscription = this.mainWrapperQuery.changes.subscribe(
      (ql: QueryList<ElementRef>) => {
        this.mainWrapper = ql.first;
        this.mainWrapperQuerySubscription.unsubscribe();
        this._setDimensions;
      }
    );
  }

  ngOnDestroy() {
    this.pageWrapperQuerySubscription.unsubscribe();
    this.mainWrapperQuerySubscription.unsubscribe();
  }

  public onNavBarCollapse(isCollapsed: boolean) {
    this.mainWrapperClasses = { collapsed: isCollapsed };
  }

  private _setDimensions = () => {
    if (this.pageWrapper && this.mainWrapper) {
      let $appHeader = $(".app-header"),
        $appFooter = $(".app-footer"),
        $pageWrapper = $(".page-wrapper"),
        $mainWrapper = $(".main-wrapper"),
        cHeight =
          window.innerHeight - $appHeader.height() - $appFooter.height();

      // this.log.debug(`${this.CLASSNAME} > _setDimensions > window`, window.innerHeight);
      // this.log.debug(`${this.CLASSNAME} > _setDimensions > $appHeader`, $appHeader.height());
      // this.log.debug(`${this.CLASSNAME} > _setDimensions > $appFooter`, $appFooter.height());
      // this.log.debug(`${this.CLASSNAME} > _setDimensions > cHeight`, cHeight);
      $pageWrapper.height(cHeight);

      let pwDims = this._getElemDimensions(this.pageWrapper.nativeElement),
        mwDims = this._getElemDimensions(this.mainWrapper.nativeElement);

      // this.log.debug(`${this.CLASSNAME} > _setDimensions > pwDims`, pwDims);
      // this.log.debug(`${this.CLASSNAME} > _setDimensions > mwDims`, mwDims);

      $mainWrapper.height(
        cHeight -
          pwDims.marginBottom -
          pwDims.marginTop -
          mwDims.paddingBottom -
          mwDims.paddingTop
      );
    }
  };

  private _getElemDimensions = (elem: HTMLElement): any => {
    return {
      height: elem.offsetHeight,
      outerHeight:
        elem.offsetHeight + elem.style.marginBottom + elem.style.marginTop,
      marginBottom: elem.style.marginBottom,
      marginTop: elem.style.marginTop,
      paddingBottom: elem.style.paddingBottom,
      paddingTop: elem.style.paddingTop
    };
  };
}
