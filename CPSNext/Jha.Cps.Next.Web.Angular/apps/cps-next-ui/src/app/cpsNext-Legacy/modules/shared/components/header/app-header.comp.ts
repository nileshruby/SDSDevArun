import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import {
  AccountService,
  LoggingService,
  ProductService,
  SessionService
} from "@app/services";
import { UserContext } from "@entities/user-context";
import { ProductContext, IUserDetails } from "@entities/models";
import { APP_KEYS } from "@entities/app-keys";
import { CONSTANTS } from "@entities/constants";
import { PRODUCT_IDS } from "@app/entities/product-ids";

@Component({
  selector: "app-header",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./app-header.html",
  styleUrls: ["./app-header.scss"]
})
export class AppHeaderComponent implements OnInit {
  protected readonly CLASSNAME = "AppHeaderComponent";
  firstName: string = "";
  lastName: string = "";
  lastLogin: string = "";

  public get adminRouteBase() {
    return "/" + CONSTANTS.app.adminRouteBase;
  }

  public get productsRouteBase() {
    return "/" + CONSTANTS.app.productsRouteBase;
  }

  public userContext: UserContext;
  public currentUrl = "";
  public productCodeAllowed = [];
  public navItems = {
    products: [],
    admin: []
  };
  public showSessionExpiry: boolean = false;
  public userDetails: IUserDetails;
  constructor(
    private _accountSvc: AccountService,
    private _router: Router,
    private _prodSvc: ProductService,
    private _sessionSvc: SessionService,
    private _log: LoggingService
  ) {
    this._sessionSvc
      .onUpdate<UserContext>(APP_KEYS.userContext)
      .subscribe(this._processUserContext);
  }

  ngOnInit() {
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = this._router.url;
      }
    });
    // this._accountSvc.getUserDetails().subscribe(
    //   response => {
    //     if (response.data && response.data.userId) {
    //       this.userDetails = response.data;
    //       this.firstName = response.data.firstName;
    //       this.lastName = response.data.lastName;
    //       this.lastLogin = response.data.lastLoginDateTime;
    //     }
    //   }
    // );
    this._processUserContext(this._sessionSvc.get(APP_KEYS.userContext));
    //TODO: Update when user permissions are integrated
    this._processUserPermissions();
  }

  public isUserProduct(productId: number) {
    let ret = false;
    this._sessionSvc
      .get(APP_KEYS.userContext)
      .assginedProducts.forEach(prdId => {
        if (prdId.productId.toString() === productId.toString()) {
          ret = true;
        }
      });
    return ret;
  }
  private _processUserContext = (userContext: UserContext) => {
    this.productCodeAllowed = [
      PRODUCT_IDS.CRDMNT,
      PRODUCT_IDS.CPSRTP,
      PRODUCT_IDS.QR
    ];
    this.userContext = userContext;
    this._accountSvc
      .getUserDetailsByUserName(this.userContext.username)
      .subscribe(
        response => {
          if (response.Data && response.Data.UsrID) {
            this.userDetails = response.Data;
            this.firstName = response.Data.FirstName;
            this.lastName = response.Data.LastName;
            this.lastLogin = response.Data.LastLoginDateTime;
          }
        },
        (err: any) => {}
      );
    if (this.userContext) {
      if (this.userContext.assginedProducts) {
        this._prodSvc.getProducts().subscribe(
          response => {
            if (response) {
              this.navItems.products = response
                .filter((ap: ProductContext) => {
                  if(userContext.isSysAdmin){
                    if (this.isUserProduct(ap.productId)) {
                      if (ap.productId != PRODUCT_IDS.INTRO) return ap;
                    }
                  }else{
                  if (this.isUserProduct(ap.productId) && ap.isOffered) {
                    if (ap.productId != PRODUCT_IDS.INTRO) return ap;
                  }}
                })
                .map((ap: ProductContext) => {
                  return <INavItem>{
                    id: ap.productId,
                    text: ap.productName,
                    url: `${this.productsRouteBase}/${ap.productCode}`,
                    icon: ""
                  };
                });
            }
          },
          (err: any) => {}
        );
      } 
      else {
        this.navItems.products = [];
      }
    }
  };

  private _processUserPermissions = () => {
    if (this.userContext.isSysAdmin) {
      this.navItems.admin = [
        <INavItem>{
          id: 1,
          text: "Financial Institutions",
          url: `${this.adminRouteBase}/fiadmin`,
          icon: ""
        },
        <INavItem>{
          id: 2,
          text: "Products",
          url: `${this.adminRouteBase}/productmaint`,
          icon: ""
        },
        <INavItem>{
          id: 3,
          text: "User Administration",
          url: `${this.adminRouteBase}/adminusermaint`,
          icon: ""
        },
        <INavItem>{
          id: 3,
          text: "Service Host Container",
          url: `${this.adminRouteBase}/servicehost`,
          icon: ""
        }
      ];
    } else this.navItems.admin = [];
  };

  private _processProducts = (products: ProductContext[]) => {
    // `${this.productsRouteBase}/`
  };
}

interface INavItem {
  id: number;
  text: string;
  url: string;
  icon: string;
}
