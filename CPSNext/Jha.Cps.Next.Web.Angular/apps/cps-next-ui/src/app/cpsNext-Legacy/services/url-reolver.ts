import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import { Resolve } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from '@node_modules/rxjs/internal/operators';
//import * as serverConfigFile from "config.json";
//console.log(serverConfigFile);
@Injectable()
export class UrlResolver implements Resolve<any> {
  protected readonly CLASSNAME = 'StartupService';
  serverUrl = '';
  constructor(private _http: HttpClient) {
  }

  resolve(){
    return this._http.get('settings/appsettings.json').pipe(
        map((response: any) => {
            // this._handleErrors(response);
            this.serverUrl = response.api.serverUrl;
            return response;
          })
    );
  }
}

