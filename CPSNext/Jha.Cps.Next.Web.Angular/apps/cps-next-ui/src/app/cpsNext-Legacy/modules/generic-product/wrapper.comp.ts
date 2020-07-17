import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  LoggingService,
  ProductService,
  SessionService,
  AccountService
} from "@app/services";
import { APP_KEYS } from "@entities/app-keys";
import { INavMenuConfig, INavMenuItem } from "@entities/nav-menu.i";
import { CONSTANTS } from "@entities/constants";
import { PRODUCT_IDS } from "@entities/product-ids";
import { ProductContext, ProductMenuFeature } from "@entities/models";
import { ModuleWrapperComponent } from "@shared/components/module-wrapper/module-wrapper.comp";
import * as _ from "lodash";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "generic-product",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./generic-product.scss"],
  template: `
    <div #pageWrapper class="container-fluid page-wrapper">
      <module-nav (onCollapse)="onNavBarCollapse($event)"></module-nav>

      <div
        #mainWrapper
        class="main-wrapper pull-right"
        [ngClass]="mainWrapperClasses"
      >
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class CM_WrapperComponent extends ModuleWrapperComponent {
  protected readonly CLASSNAME = "CM_WrapperComponent";

  private _productContext: ProductContext = null;
  private _routeConfig = <INavMenuConfig>{
    title: "",
    titleIconClass: "",
    value: "",
    items: []
  };
  public productCode;
  public productID = 0;
  public menusList: ProductMenuFeature[] = [];
  constructor(
    logger: LoggingService,
    private _sessionSvc: SessionService,
    private _accountSvc: AccountService,
    private _prodSvc: ProductService,
    private router: Router,
    private rout: ActivatedRoute
  ) {
    super(logger);
    this.rout.params.subscribe(param => {
      this.productCode = this.rout.snapshot.params.param;
      this.onParamChange();
      this._getFeatureMenu();
    });
  }

  onParamChange() {
    const userContext = this._sessionSvc.get(APP_KEYS.userContext);
    if (userContext && userContext.assginedProducts) {
      let product = _.filter(
        userContext.assginedProducts,
        prod => prod.productCode === this.productCode
      );
      if (product.length > 0) {
        this.productID = product[0].productId;
        this._prodSvc.getProducts().subscribe(response => {
          if (response && response.length) {
            this._productContext = response.find((product: ProductContext) => {
              return product.productId === this.productID;
            });
            this._routeConfig.title = this._productContext.productName;
            this._setRoutes();
          }
        });
      } else {
        this.router.navigate(["/dashboard"]);
      }
    } else {
      this.router.navigate(["/dashboard"]);
    }
  }

  private _setRoutes() {
    let routeBase = `/${CONSTANTS.app.productsRouteBase}/${this._productContext.productCode}/`;
    let userContext = this._sessionSvc.get(APP_KEYS.userContext);

    this._routeConfig.value = routeBase;
    this._routeConfig.items = [];

    if (this._productContext.featureMenu) {
      let menuWork = <INavMenuItem>{
        text: "Workflow",
        isSection: true,
        children: []
      };
      let menuAdmin = <INavMenuItem>{
        text: "Administration",
        isSection: true,
        children: []
      };

      this._productContext.featureMenu.split(",").forEach(FMenu => {
        let FMenuID = Number(FMenu);
        var filtereMenuList = this.menusList.filter(function(menu) {
          return FMenuID === menu.MenuID;
        });
        if (filtereMenuList.length > 0) {
          let singleMenu = filtereMenuList[0];
          let navigatMenu = <INavMenuItem>{
            text: singleMenu.Name,
            value: routeBase + singleMenu.Url
          };

          if (singleMenu.GroupName == "Workflow") {
            menuWork.children.push(navigatMenu);
          } else if (singleMenu.GroupName == "Administration") {
            if (
              userContext.isSysAdmin ||
              userContext.isJHAUser ||
              this.isRoleAdmin()
            ) {
              menuAdmin.children.push(navigatMenu);
            }
          }
        }
      });
      this._routeConfig.items.push(menuWork, menuAdmin);
    }
    this._sessionSvc.set(APP_KEYS.ModuleNavConfig, this._routeConfig);
  }

  isRoleAdmin(): boolean {
    let result: boolean = false;
    const userContext = this._sessionSvc.get(APP_KEYS.userContext);
    // console.log(userContext);
    if (userContext && userContext.assginedProducts) {
      let productRTP = _.filter(
        userContext.assginedProducts,
        prod => prod.productId === PRODUCT_IDS.CPSRTP
      );
      if (productRTP.length) {
        result = productRTP[0].role === "Admin";
      }
    }
    return result;
  }
  private _getFeatureMenu() {
    this._prodSvc.getProductMenuFeature().subscribe(
      response => {
        let featureMenu = response.Data;
        featureMenu.forEach(menuList => {
          this.menusList.push(menuList);
        });
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
}
