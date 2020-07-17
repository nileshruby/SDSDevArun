import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { APP_KEYS } from "@app/entities/app-keys";
import { SessionService } from "@app/services";

@Injectable()
export class InsertHeadersInterceptor implements HttpInterceptor {
  constructor(private sessionSvc: SessionService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.sessionSvc.get(APP_KEYS.HTTP_AUTH_TOKEN);

    var msg = "undefined";
    if (token) {
      msg = "  defined";
    }
    console.log(msg, request.url);
    new Object();

    request = request.clone({
      headers: request.headers.set("Content-Type", "application/json")
    });
    request = request.clone({
      headers: request.headers.set("dataType", "json")
    });

    if (token) {
      if (!request.headers.has(APP_KEYS.HTTP_AUTH_TOKEN)) {
        request = request.clone({
          headers: request.headers.set(APP_KEYS.HTTP_AUTH_TOKEN, token)
        });
      } else {
        console.log("token is empty.");
      }
    }

    // next.handle(request).pipe(Response(response)

    return next.handle(request);
  }
}
