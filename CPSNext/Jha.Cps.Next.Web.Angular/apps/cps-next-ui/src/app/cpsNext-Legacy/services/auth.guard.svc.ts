import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { LoggingService } from "./logging.svc";
import { SessionService } from "./session.svc";
import { APP_KEYS } from "@entities/app-keys";
import { UserContext } from "@entities/user-context";
import { PRODUCT_IDS } from "@app/entities/product-ids";

@Injectable()
export class AuthGuardService implements CanActivate {
  protected readonly CLASSNAME = "AuthGuardService";

  constructor(
    private _router: Router,
    private _sessionSvc: SessionService,
    private _log: LoggingService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this._sessionSvc.get(APP_KEYS.productIDS)) {
      //console.log(this._sessionSvc.get(APP_KEYS.productIDS));
      for (const key in this._sessionSvc.get(APP_KEYS.productIDS)) {
        PRODUCT_IDS[key] = this._sessionSvc.get(APP_KEYS.productIDS)[key];
      }
    }
    let userContext: UserContext = this._sessionSvc.get(APP_KEYS.userContext);

    if (
      !userContext ||
      !userContext.assginedProducts ||
      !userContext.assginedProducts.length
    ) {
      this._log.debug(
        `${this.CLASSNAME} > canActivate: User Not Validated.  Routing to Login.`
      );
      // this._router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
      this._router.navigate(["/login"]);
      return false;
    }
    return true;
  }
}
