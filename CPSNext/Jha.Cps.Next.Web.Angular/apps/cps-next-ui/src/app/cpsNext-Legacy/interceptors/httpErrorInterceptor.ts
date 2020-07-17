import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { AuthGuardService } from "@app/services";
import { Router } from "@angular/router";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthGuardService,
    private _router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      this.isSaveURL(request.url) === false ||
      this.isSaveURL(this._router.url) === false
    ) {
      this._router.navigate(["/error"]);
      return next.handle(request);
    }

    // console.log('Caller has arguments ==> ' + next.handle.arguments);
    // console.log('HTTP Request: ' + request.urlWithParams);

    return next.handle(request).pipe(
      catchError(err => {
        // if(err.status === 401 || err.status=== 404) {
        if (err.status === 401) {
          if (this.authenticationService.canActivate) {
            //Route to Error Page
            this._router.navigate(["/error"]);
          } else {
            //Route to Login Page
            this._router.navigate(["/login"]);
          }
        } else {
          const error = err.error.message || err.statusText;
          this._router.navigate(["/error"]);
        }
        //Log Error
        const error = err.error.message || err.statusText;
        return throwError(error);
      })
    );
  }

  isSaveURL(url: string): Boolean {
    let safeURL = true;
    const badValues: string[] = ["?", "=", "+", "<", "\0", "%00", "0x00"];

    // const lst = this._router.config.values;
    // this._router.config.forEach( s => { console.log(s.path); } );

    //if '/' exist in url
    // inspect remainer of url to verify valid ( list of configured routes from router) is safe route
    // else redirect to error page

    badValues.forEach(x => {
      if (url.indexOf(x) >= 0) {
        console.log("[" + url + "] " + "is a potentially danganrous URL");
        safeURL = false;
      } else {
        // console.log('Good URL :[' + url + ']');
      }
    });

    return safeURL;
  }
}
