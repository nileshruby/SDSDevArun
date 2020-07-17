import {Injectable} from '@angular/core';
import {Route, Router} from '@angular/router';

import {AuthGuardService} from '@services/auth.guard.svc';
import {ProductService} from '@services/product.svc';
import {SessionService} from '@services/session.svc';
import {LoggingService} from '@services/logging.svc';
import {ProductContext} from '@entities/models';
import {UserContext} from '@entities/user-context';
import {CONSTANTS} from '@entities/constants';
import {APP_KEYS} from '@entities/app-keys';


@Injectable()
export class NavigationService {
  protected readonly CLASSNAME = 'NavigationService';

  private _productRoutes: IProductRouteInfo[] = [{
    productId: 2,
    modulePath: 'CardMaintModule'
  }];

  // private _productRoutes: IProductRouteInfo[] = [{
  //   productId: 2,
  //   modulePath: './modules/card-maint/card-maint.mod#CardMaintModule'
  // }];

  constructor(private _router: Router,
              private _prodSvc: ProductService,
              private _sessionSvc: SessionService,
              private _log: LoggingService) {
    // console.log(`${this.CLASSNAME} > constructor()`);
  }

  public setupProductRouting(callback?:any) {
    let userContext:UserContext = this._sessionSvc.get(APP_KEYS.userContext);

    if(!userContext || !userContext.assginedProducts || !userContext.assginedProducts.length)
      return;

    let cfg = this._router.config,
      prodCfg = cfg.find((route: Route) => {
        return route.path === CONSTANTS.app.productsRouteBase;
      });

    if(!prodCfg.children)
      prodCfg.children = [];

    this._prodSvc.getProducts().subscribe(
      products => {
        if(!products || !products.length)
          return;

        products.forEach((product: ProductContext) => {
          if (!prodCfg.children.find((route: Route) => {
            return route.path === product.routeName;
          })) {
            let productRoute = this._productRoutes.find((pr: IProductRouteInfo) => {
              return pr.productId === product.productId;
            });

            if (productRoute) {
              prodCfg.children.unshift({
                path: product.routeName,
                canActivate: [AuthGuardService],
                loadChildren: productRoute.modulePath
              });
            }
          }
        });

        this._router.resetConfig(cfg);

        if(callback)
          callback();
      }
    );

    this._log.debug(`${this.CLASSNAME} > setupProductRouting() > _router.config`, this._router.config);
  }
}

interface IProductRouteInfo {
  productId: number;
  modulePath: any;
}
