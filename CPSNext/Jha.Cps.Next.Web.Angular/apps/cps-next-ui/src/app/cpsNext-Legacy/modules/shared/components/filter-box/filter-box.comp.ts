import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy
} from "@angular/core";

import { LoggingService } from "@app/services";
import { Subscription } from "rxjs";

@Component({
  selector: "filter-box",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./filter-box.scss"],
  template: `
    <div class="filter-box">
      <input
        id="mysearch"
        class=""
        #mysearch
        type="text"
        [value]="searchText"
        [placeholder]="placeholder"
        (keyup)="onKeyUp($event)"
        style="height: 35px;color: #222222;"
      />
      <button class="close-icon" type="reset" (click)="emitClearClicked()">
        <i class="fa fa-times"></i>
      </button>
    </div>
  `
})
export class SearchBoxComponent implements AfterViewInit, OnDestroy  {
  protected readonly CLASSNAME = "SearchBoxComponent";

  private readonly _classes = {
    open: "modal-open",
    closed: "modal-closed"
  };

  @Input() value(value: string) {
    if (this.searchText !== value) this.searchText = value;
  }
   @ViewChildren("mysearch")
  mysearchQuery: QueryList<ElementRef>;
  mysearchQuerySubscription: Subscription;
  mysearch: ElementRef;

  @Input() placeholder = "";

  @Output() onChange = new EventEmitter<string>();
  @Output() onClear: EventEmitter<any> = new EventEmitter();

  public searchText = "";

  //private _searchText = "";

  constructor(private _log: LoggingService) {}

  // public clear($event: any) {
  //   console.log(
  //     "Value is:" +
  //       $event.target.parentNode.value +
  //       "target value:" +
  //       $event.target.value
  //   );
  //   console.log("searchText : " + this.searchText);

  //   this.searchText = "";
  // }
  ngAfterViewInit(): void {
    this.mysearchQuerySubscription = this.mysearchQuery.changes.subscribe(
      (ql: QueryList<ElementRef>) => {
        this.mysearch = ql.first;
        this.mysearchQuerySubscription.unsubscribe();
      }
    );

  }

  ngOnDestroy() {
    this.mysearchQuerySubscription.unsubscribe();
  }
  public onKeyUp($event: any) {
    // this._log.debug(`${this.CLASSNAME} > onKeyUp() > $event: `, $event);

    switch ($event.keyCode) {
      case 13:
        this.searchText = $event.target.value;
        this.emitClearClicked();
        return;
      case 27:
        $event.target.value = "";
        break;
    }

    this.searchText = $event.target.value;
    this.onChange.emit(this.searchText);
  }

  public emitClearClicked() {
    if (this.searchText) {
      this.onClear.emit();
    }
    this.mysearch.nativeElement.value = "";
  }
}
