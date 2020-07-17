import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
  ElementRef,
  QueryList,
  ViewChildren,
  OnDestroy
} from "@angular/core";
import { LoggingService, ProductService, SessionService } from "@app/services";
import { ProductContext } from "@entities/models";
import { VaultService } from "./../../services/vault.svc";
import * as $ from "jquery";
import { PRODUCT_IDS } from "@app/entities/product-ids";
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop";
import { APP_KEYS } from "@app/entities/app-keys";
import { UserContext } from "@app/entities/user-context";
import * as _ from "lodash";
import { Subscription } from "rxjs";

@Component({
  selector: "dash-page",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./dashboard.html",
  styleUrls: ["./dashboard.scss"]
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = "DashboardPage";

  @ViewChildren("widgetsContent") widgetsContentQuery: QueryList<ElementRef>;
  public widgetsContent: ElementRef<any>;
  public products: ProductContext[] = [];
  public introductionProduct: ProductContext[] = [];
  public withoutIntroProducts: ProductContext[] = [];
  public prdList: string[] = [];
  introProduct = PRODUCT_IDS.INTRO;
  public slideConfig = {
    dots: false,
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    fade: false,
    adaptiveHeight: true,
    arrows: true
  };
  public showRight = true;
  public showLeft = false;
  _userDetails: UserContext = this._sessionSvc.get(APP_KEYS.userContext);
  public collapseProducts = false;
  public selectedProductContext: ProductContext;
  constructor(
    private _prodSvc: ProductService,
    private _log: LoggingService,
    private _sessionSvc: SessionService,
    private _valutService: VaultService
  ) {}

  ngOnInit() {
    this._prodSvc.getProducts().subscribe(response => {
      this.introductionProduct = [];
      this.withoutIntroProducts = [];
      this.products = response || [];

      let productList = this._valutService.get("assessableProducts");

      if (productList) {
        this.prdList = productList.split("|");
      }

      this.products = this.products
        .filter((ap: any) => {
          if (this.isUserProduct(ap.productId) && ap.isOffered) {
            if (ap.productId == PRODUCT_IDS.INTRO) {
              this.introductionProduct.push(ap);
            } else {
              this.withoutIntroProducts.push(ap);
            }

            return ap;
          }
        })
        .map((ap: any) => {
          return ap;
        });
    });
  }

  widgetsContentQuerySubscription: Subscription;
  ngAfterViewInit() {
    this.widgetsContentQuerySubscription = this.widgetsContentQuery.changes.subscribe(
      (ql: QueryList<ElementRef>) => {
        this.widgetsContent = ql.first;
        this.widgetsContentQuerySubscription.unsubscribe();
        this.loadScroll();
      }
    );
  }

  ngOnDestroy() {
    this.widgetsContentQuerySubscription.unsubscribe();
  }

  public loadScroll(): void {
    // console.log(this.widgetsContent);
    let mainwidth = this.widgetsContent.nativeElement.offsetWidth;
    let sliderwidth = this.widgetsContent.nativeElement.scrollWidth - 2;
    if (sliderwidth == mainwidth) {
      this.showRight = false;
      this.showLeft = false;
    } else if (sliderwidth > mainwidth) {
      if (this.widgetsContent.nativeElement.scrollLeft > 0) {
        this.showLeft = true;
      } else {
        this.showLeft = false;
      }
      let rightS =
        this.widgetsContent.nativeElement.scrollWidth -
        this.widgetsContent.nativeElement.scrollLeft;
      if (rightS == mainwidth) {
        this.showRight = false;
      } else {
        this.showRight = true;
      }
    }
  }
  public scrollRight(): void {
    this.widgetsContent.nativeElement.scrollTo({
      left: this.widgetsContent.nativeElement.scrollLeft + 450,
      behavior: "smooth"
    });
    this.showLeft = true;
  }

  public scrollLeft(): void {
    this.widgetsContent.nativeElement.scrollTo({
      left: this.widgetsContent.nativeElement.scrollLeft - 450,
      behavior: "smooth"
    });
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.withoutIntroProducts,
      event.previousIndex,
      event.currentIndex
    );
    this.withoutIntroProducts.forEach((i, index) => {
      i.displayOrder = index + 1;
    });
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    let updateProduct: any = {
      usrID: this._userDetails.userId
    };
    updateProduct.products = this.withoutIntroProducts;
    this._prodSvc.updateDisplayOrderForUserProduct(updateProduct).subscribe(
      response => {
        if (response.Data && response.Data.Success) {
          let pro = Object.assign([], this.withoutIntroProducts);
          this.updateDisplayOrder(pro);
        }
      },
      err => {}
    );
  }

  public isAvailable(item) {
    return this.prdList.find(item) == null ? false : true;
  }

  public updateDisplayOrder(products: any) {
    let _userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (_userDetails && _userDetails.assginedProducts) {
      _userDetails.assginedProducts.forEach(elem => {
        products.forEach(prods => {
          if (elem.productId.toString() === prods.productId.toString()) {
            elem.displayOrder = prods.displayOrder;
          }
        });
      });
    }
    _userDetails.assginedProducts = _.sortBy(
      _userDetails.assginedProducts,
      "displayOrder"
    );
    this._sessionSvc.set(APP_KEYS.userContext, _userDetails);
    this._sessionSvc.set(APP_KEYS.Prods, _userDetails.assginedProducts);
  }

  public isUserProduct(productId: number) {
    let ret = false;
    this.prdList.forEach(prdId => {
      if (prdId.toString() === productId.toString()) {
        ret = true;
      }
    });
    return ret;
  }

  public onProductCardClick(productId: number) {
    if (
      this.selectedProductContext &&
      this.selectedProductContext.productId === productId
    ) {
      this.selectedProductContext = null;
      this.collapseProducts = false;
    } else {
      this.selectedProductContext = this.products.find((p: ProductContext) => {
        return p.productId === productId;
      });
      this.collapseProducts = !!this.selectedProductContext;
    }
  }
}
