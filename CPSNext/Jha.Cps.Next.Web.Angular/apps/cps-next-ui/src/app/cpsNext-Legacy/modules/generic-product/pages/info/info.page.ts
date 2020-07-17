import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '@app/services';
import { APP_KEYS } from '@app/entities/app-keys';
import * as _ from 'lodash';
@Component({
  selector: 'cm-info',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './info.html',
  styleUrls: ['./info.scss']
})

export class InfoPage  {
  protected readonly CLASSNAME = 'InfoPage';
  public productCode;
  public aProduct;
  productName = '';
  productId = 0;
  constructor(private _sessionSvc: SessionService,
    private rout: ActivatedRoute) {
      this.rout.params.subscribe(param => {
        this.productCode = this.rout.parent.snapshot.params.param;
        this.onParamChange();
      })
  }

  onParamChange() {
    const userContext = this._sessionSvc.get(APP_KEYS.userContext);
      if (userContext && userContext.assginedProducts) {
        let prod = _.filter(userContext.assginedProducts, (prod) => prod.productCode === this.productCode);
        this.aProduct = prod[0];
        this.productName = this.aProduct.productName;
        this.productId = this.aProduct.productId;
      }
  }
}
