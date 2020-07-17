import { AfterViewInit, Component, ElementRef, Input } from "@angular/core";

import { LoggingService, VaultService, ProductService } from "@app/services";
import { ProductContext, RTPDashboardStats } from "@entities/models";
import { CONSTANTS } from "@entities/constants";
import { IApiResponseBackend } from "@app/entities/api-response";

@Component({
  selector: "dash-product-details",
  templateUrl: "./dash-product-details.html",
  styleUrls: ["./dash-product-details.scss"]
})
export class DashboardProductDetailsComponent implements AfterViewInit {
  protected readonly CLASSNAME = "DashboardProductDetailsComponent";
  public rtpStats: RTPDashboardStats;

  @Input() set details(context: ProductContext) {
    this.productContext = context;
    this._initDetails();
  }

  public $chartPanel: any;
  public prdList: string[] = [];
  public productsRouteBase = CONSTANTS.app.productsRouteBase;
  public productContext: ProductContext = null;

  constructor(
    private _log: LoggingService,
    private _vaultService: VaultService,
    private _prdSvc: ProductService
  ) {}

  ngAfterViewInit() {
    if (this.productContext) this._initDetails();
  }

  private _initDetails() {}

  public isUserProduct(productId: number) {
    let ret = false;
    this.prdList.forEach(prdId => {
      if (prdId.toString() === productId.toString()) {
        ret = true;
      }
    });
    return ret;
  }

  ngOnInit() {
    let prdList = this._vaultService.get("assessableProducts");
    if (prdList) {
      this.prdList = this._vaultService.get("assessableProducts").split("|");
    }
    this.getRtpProductStatsCount(this.productContext.productId);
  }

  public getRtpProductStatsCount(productId: number) {
    this._prdSvc
      .getRtpProductStatsCount(productId)
      .subscribe((stat: IApiResponseBackend) => {
        if (stat.Data) {
          this.rtpStats = stat.Data;
        }
      });
  }
}
