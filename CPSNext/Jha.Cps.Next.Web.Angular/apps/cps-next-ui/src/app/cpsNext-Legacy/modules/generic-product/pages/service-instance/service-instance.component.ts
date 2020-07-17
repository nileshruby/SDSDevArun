import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { SessionService } from '@app/services';
import { ActivatedRoute } from '@angular/router';
import { UserContext } from '@app/entities/user-context';
import { APP_KEYS } from '@app/entities/app-keys';
import * as _ from 'lodash';

@Component({
  selector: 'Cart-service-instance',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './service-instance.component.html',
  styleUrls: ['./service-instance.component.css']
})
export class ServiceInstanceComponent implements OnInit {
  protected readonly CLASSNAME = 'CM_FiOnboardingPage';

  public productCode;
  public aProduct;
  public _userDetails: UserContext = null;
  public prodId = 0;
  constructor( private _sessionSvc: SessionService,
    private rout: ActivatedRoute) {
      this.productCode = this.rout.parent.snapshot.params.param;
      this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
      if (this._userDetails && this._userDetails.assginedProducts) {
        let prod = _.filter(this._userDetails.assginedProducts, (prod) => prod.productCode === this.productCode);
        this.aProduct = prod[0];
        this.prodId = this.aProduct.productId;
      }
     }
  ngOnInit() { }
}
