import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

import {LoggingService, SessionService} from '@app/services';
import {APP_KEYS} from '@entities/app-keys';
import {UserContext} from '@entities/user-context';

@Injectable()
export class AdminAuthGuardService implements CanActivate {
  protected readonly CLASSNAME = 'AdminAuthGuardService';

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

    if(!userContext.isSysAdmin){
      // Not SysAdmin, so no access to admin section
      return false;
    }

    this._log.debug(`${this.CLASSNAME} > canActivate: User Validated`);
    return true;
  }
}

