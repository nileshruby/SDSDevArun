import { Injectable } from "@angular/core";
import { HttpBaseService } from "@services/http.svc";
import { SessionService } from "@services/session.svc";
import { LoggingService } from "@services/logging.svc";
import { IApiResponse } from "@entities/api-response";
import { APP_KEYS } from "@entities/app-keys";
import { AccountService } from "./account.svc";
import * as _ from "lodash";
//import * as serverConfigFile from "config.json";
//console.log(serverConfigFile);
@Injectable()
export class StartupService {
  protected readonly CLASSNAME = "StartupService";

  constructor(
    private _http: HttpBaseService,
    private _sessionSvc: SessionService,
    private _accountSvc: AccountService,
    private _log: LoggingService
  ) {
    // console.log(`${this.CLASSNAME} > constructor()`);
    // this._log.debug(`${this.CLASSNAME} > constructor() > _http.instanceId: ${_http.instanceId}`);
  }

  public initializeApp(): Promise<any> {
    // this._log.debug(`${this.CLASSNAME} > initializeApp()`);
    let token: string = this._sessionSvc.get(APP_KEYS.HTTP_AUTH_TOKEN);

    //const urlList = this._http.getByUrl('config.json').subscribe( response => {
    //  const value = JSON.stringify(response);
    //  // console.log('API: ' + JSON.parse(value).api.url);
    //  // console.log('serverAPI: ' + JSON.parse(value).api.serverUrl);
    //  //this._sessionSvc.set('API',JSON.parse(value).api.url);

    //  this._sessionSvc.set('serverUrl', JSON.parse(value).api.serverUrl);
    //});

    return new Promise((resolve, reject) => {
      if (token) {
        return this._http
          .get("account/getUserContext")
          .toPromise()
          .then((response: IApiResponse) => {
            this._log.debug(
              `${this.CLASSNAME} > initializeApp() > response: `,
              response
            );

            if (response.data && response.data.username) {
              // this._accountSvc.getUserDetailsByUserName(response.data.username).subscribe(
              //   rep => {
              //     response.data.isJHAUser = rep.data.isJHAUser;
              //     response.data.fiid = rep.data.fiid;
              //     response.data.isSysAdmin = rep.data.isSysAdmin;
              //     if (this._sessionSvc.get(APP_KEYS.Prods)) {
              //       let _userDetails = this._sessionSvc.get(APP_KEYS.userContext);
              //       let products = this._sessionSvc.get(APP_KEYS.Prods);
              //       if (_userDetails && _userDetails.assginedProducts) {
              //         _userDetails.assginedProducts.forEach(elem => {
              //           products.forEach(prods => {
              //             if (elem.productId.toString() === prods.productId.toString()) {
              //               elem.displayOrder = prods.displayOrder;
              //             }
              //           })
              //         });
              //       }
              //       _userDetails.assginedProducts = _.sortBy(_userDetails.assginedProducts, 'displayOrder');
              //       this._sessionSvc.set(APP_KEYS.userContext, _userDetails);
              //       this._sessionSvc.set(APP_KEYS.Prods, _userDetails.assginedProducts);
              //     } else {
              //       this._sessionSvc.set(APP_KEYS.userContext, response.data);
              //     }
              //   },(err: any) => {});
            } else this._sessionSvc.clearSession();

            resolve();
          })
          .catch(reason => {
            this._sessionSvc.clearSession();
            this._log.error(
              `${this.CLASSNAME} > initializeApp() > Error: ${reason}`
            );
            resolve();
          });
      } else {
        // this._log.debug(`${this.CLASSNAME} > initializeApp() > No token`);
        resolve();
      }
    });
  }
}
