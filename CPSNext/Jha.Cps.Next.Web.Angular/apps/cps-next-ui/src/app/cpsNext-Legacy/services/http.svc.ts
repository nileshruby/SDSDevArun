import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

import { ToastrService } from "@node_modules/ngx-toastr";

import { Observable, Subject, BehaviorSubject } from "rxjs";
import { map } from "@node_modules/rxjs/internal/operators";

import { APP_KEYS } from "@entities/app-keys";

import { environment } from "../../../environments/environment";

import * as _ from "lodash";
import { VaultService } from "@services/vault.svc";
import { SessionService } from "./session.svc";
import { SingletonService } from "./singleton.svc";
import { CONSTANTS } from "../entities/constants";
import { JSEncrypt } from "jsencrypt";

@Injectable()
export class HttpBaseService {
  protected readonly CLASSNAME = "HttpBaseService";
  public apiBaseUrl = "";

  constructor(
    private _http: HttpClient,
    private _vault: VaultService,
    private _singleTonService: SingletonService,
    private _toastr: ToastrService,
    private _sessionSvc: SessionService
  ) {
    this.apiBaseUrl = environment.api.url;
  }

  private updateToken(response: any, url: string) {
    var token = response.headers.get(APP_KEYS.HTTP_AUTH_TOKEN);
    if (token == null) {
      //FIXME this._vault.remove(APP_KEYS.HTTP_AUTH_TOKEN);
    } else {
      this._vault.set(APP_KEYS.HTTP_AUTH_TOKEN, token);
      this.setExpiration(response, url);
    }
  }

  setExpiration(response: any, url: string) {
    var expirationStr = response.headers.get(APP_KEYS.EXPIRATION);

    //let expirationStr = response.body.Expiration || response.body.expiration;
    if (expirationStr && expirationStr.length > 0) {
      const milliseconds = Date.parse(expirationStr);
      if (!isNaN(milliseconds)) {
        let expiration = new Date(Date.parse(expirationStr));
        // console.log(
        //   `${
        //     this.CLASSNAME
        //   }.setExpiration: expiration=${expiration.toShortTimeString()}, url=${url}`
        // );

        this._sessionSvc.setExpiration(expiration, url);
      }
    }
  }

  public get<T>(url: string, options?: any): Observable<T> {
    let localUrl = url;
    if (url.indexOf("http") === -1) {
      localUrl = this.apiBaseUrl + url;
    }
    return this._http.get<T>(localUrl, this._getOptions(options)).pipe(
      map((response: any) => {
        this.updateToken(response, url);
        return response.body;
      })
    );
  }

  // public getByUrl<T>(url: string, options?: any) {
  //   return this._http.get<T>(url, this._getOptions(options));
  // }

  public post<T>(url: string, data: any, options?: any): Observable<T> {
    let localUrl = url;
    if (url.indexOf("http") === -1) {
      localUrl = this.apiBaseUrl + url;
    }
    return this._http.post<T>(localUrl, data, this._getOptions(options)).pipe(
      map((response: any) => {
        this.updateToken(response, url);
        return response.body;
      })
    );
  }

  public delete<T>(url: string, options?: any): Observable<T> {
    return this._http
      .delete<T>(this.apiBaseUrl + url, this._getOptions(options))
      .pipe(
        map((response: any) => {
          this.updateToken(response, url);
          return response.body;
        })
      );
  }

  private _getOptions = (op: any = {}): IHttpOptions => {
    let options = _.merge(
      {
        observe: "response",
        reportProgress: false,
        responseType: "json",
        withCredentials: true
      },
      op
    );

    return options;
  };

  private _handleErrors(response: any) {
    if (response && response.errorMessages && response.errorMessages.length) {
      response.errorMessages.forEach((msg: string) => {
        this._toastr.error(msg);
      });
    }
  }
}

interface IHttpOptions {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: "body";
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
}
