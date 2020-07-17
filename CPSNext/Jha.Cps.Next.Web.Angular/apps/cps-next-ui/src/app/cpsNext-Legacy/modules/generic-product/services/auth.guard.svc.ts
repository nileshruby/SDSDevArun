import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

import {LoggingService, SessionService} from '@app/services';
import {APP_KEYS} from '@entities/app-keys';
import {UserContext} from '@entities/user-context';
import {ProductContext} from '@entities/models';
import { PRODUCT_IDS } from '@app/entities/product-ids';

@Injectable()
export class CardMaintAuthGuardService implements CanActivate {
  protected readonly CLASSNAME = 'CardMaintAuthGuardService';

  private _productId = PRODUCT_IDS.CPSRTP;

  constructor(private _router: Router,
              private _sessionSvc: SessionService,
              private _log: LoggingService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let userContext:UserContext = this._sessionSvc.get(APP_KEYS.userContext);

    if(!userContext || !userContext.assginedProducts || !userContext.assginedProducts.length) {
      this._log.debug(`${this.CLASSNAME} > canActivate: User Not Validated.  Routing to Login.`);
      // this._router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
      this._router.navigate(['/login']);

      // Not logged in so redirect to login page with the return url
      return false;
    }

    // If userContext.assignedProducts does not contain product,
    // user is not authorized to navigate within this product.
    try{
      let ap = userContext.assginedProducts.find((uap:ProductContext)=>{
        return uap.productId === this._productId;
      });

      if(!ap)
        return false;
    }
    catch(err){
      return false;
    }

    this._log.debug(`${this.CLASSNAME} > canActivate: User Validated`);
    return true;
  }
}

