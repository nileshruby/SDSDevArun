import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SessionService } from "@app/services";
import { APP_KEYS } from "@app/entities/app-keys";
import * as _ from "lodash";
@Component({
  selector: "config-parameters",
  templateUrl: "./config-parameters.html",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./config-parameters.scss"]
})
export class ConfigParametersPage {
  protected readonly CLASSNAME = "ConfigParametersPage";
  public productCode;
  public aProduct;
  public prodId = 0;
  constructor(
    private _sessionSvc: SessionService,
    private rout: ActivatedRoute
  ) {
    this.productCode = this.rout.parent.snapshot.params.param;
    // console.log(this.productCode);
    const userContext = this._sessionSvc.get(APP_KEYS.userContext);
    if (userContext && userContext.assginedProducts) {
      let prod = _.filter(
        userContext.assginedProducts,
        prod => prod.productCode === this.productCode
      );
      this.aProduct = prod[0];
      this.prodId = this.aProduct.productId;
    }
  }

  ngOnInit() {}
}
