import { BinContext } from './../entities/models';
import {Injectable} from '@angular/core';

import {Observable, of, Subject} from 'rxjs';
import {map} from '@node_modules/rxjs/internal/operators';

import {HttpBaseService} from '@services/http.svc';
import {SessionService} from '@services/session.svc';
import {LoggingService} from '@services/logging.svc';
import {IApiResponse,IApDeleteResponse,IBinResponse,IBinSetupResponse} from '@entities/api-response';
import {FiContext} from '@entities/models';
import {APP_KEYS} from '@entities/app-keys';
import {IProductVersion} from '@entities/models';
import { environment } from '@env/environment';
import { UrlResolver } from './url-reolver';

@Injectable()
export class FiService {
  protected readonly CLASSNAME = 'FiService';
  private serverUrl: string;

  constructor(private _http: HttpBaseService,
              private _sessionSvc: SessionService,
              private _log: LoggingService,
              private _url: UrlResolver) {
    // console.log(`${this.CLASSNAME} > constructor()`);
    // console.log(`${this.CLASSNAME} > constructor() > _http.instanceId: ${_http.instanceId}`);

    this._sessionSvc.remove(APP_KEYS.cachedFIs);
    this._sessionSvc.remove(APP_KEYS.cachedBINs);
   
  }

  public getFIs(): Observable<IApiResponse> {
    // let items = this._sessionSvc.get(APP_KEYS.cachedFIs);

    // if (items && items.length)
    //   return of(<IApiResponse>{data: items});

    return this._http.get(`fis/getFIs`).pipe(
      map((response: IApiResponse) => {
        if (response.data && response.data.length)
          this._sessionSvc.set(APP_KEYS.cachedFIs, response.data);
         
        return response;
      })
    );
  }

  public getFi(fiId): Observable<IApiResponse> {
    let retVal = <IApiResponse>{data: null},
      items = this._sessionSvc.get(APP_KEYS.cachedFIs);

    if (items && items.length) {
      retVal.data = items.find((p: FiContext) => {
        return p.fiId === fiId;
      });
      return of(retVal);
    }

    let subject = new Subject<IApiResponse>();
    this._http.get('fis/getFIs').subscribe(
      (response: IApiResponse) => {
        if (response.data && response.data.length)
          this._sessionSvc.set(APP_KEYS.cachedFIs, response.data);

        retVal.data = response.data.find((p: FiContext) => {
          return p.fiId === fiId;
        });
        subject.next(retVal);
      });
    return subject;
  }

  public saveFi(fi: FiContext): Observable<IApiResponse> {
    return this._http.post('fis/saveFi', fi).pipe(
      map((response: IApiResponse) => {
        if (response.data) {
          let items = this._sessionSvc.get(APP_KEYS.cachedFIs),
            index = items.findIndex((f: FiContext) => {
              return f.fiId === response.data.fiId;
            });

          if (index >= 0) {
            items.splice(index, 1, response.data);
            this._sessionSvc.set(APP_KEYS.cachedFIs, items);
          }
        }

        return response;
      })
    );
  }

  // public deleteFi(fiId: number): Observable<IApiResponse> {
  //   return this._http.delete(`fis/deleteFi/${fiId}`).pipe(
  //     map((response: IApiResponse) => {
  //       let items = this._sessionSvc.get(APP_KEYS.cachedFIs),
  //         index = items.findIndex((f: FiContext) => {
  //           return f.fiId === response.data.fiId;
  //         });

  //       if (index >= 0) {
  //         items.splice(index, 1);
  //         this._sessionSvc.set(APP_KEYS.cachedFIs, items);
  //       }

  //       return response;
  //     })
  //   );
  // }

  public deleteFi(fiId: number): Observable<IApDeleteResponse> {
    const url = this._url.serverUrl + 'FI/RemoveFIAccount';
      const request = 
      {
        FIID: fiId
     };
     return this._http.post(url, request).pipe(
      map((response: IApDeleteResponse) => {       
        return response;
      })
    );
  }

  public RetrieveBinSetupInformation(binid:any): Observable<BinContext[]> {
    const url = this._url.serverUrl  + 'FI/RetrieveBinSetupInformation';
    const request = {
      BinNumber: binid 
      //100004
    }
    return this._http.post(url, request).pipe(
      map((response: BinContext[]) => {
       
        return response;
      })
    );
  }
  public RetrieveBinInformation(fiid:any): Observable<BinContext[]> {
    const url = this._url.serverUrl  + 'FI/RetrieveBinInformation';
    const request = {
      FIID : 1234,
      BinNumber: 122222
      //100004
    }
    return this._http.post(url, request).pipe(
      map((response: BinContext[]) => {
       
        return response;
      })
    );
  }
  
  public saveBinSetupDetail(request: BinContext): Observable<IBinSetupResponse> {
    const url = this._url.serverUrl + 'FI/SaveBinSeupInformation';
    
    return this._http.post(url, request).pipe(
      map((response: IBinSetupResponse) => {        
        return response;
      })
    );
  }
  public getBINs(fiId?: number): Observable<IApiResponse> {
    return this._http.get(`fis/getBINs/${fiId || null}`);
  }

  public saveBin(productVerion: IProductVersion): Observable<IApiResponse> {
    return this._http.post('fis/saveBin', productVerion);
  }

  public SaveBinInformation(request: BinContext): Observable<IBinResponse> {
    const url = this._url.serverUrl + 'FI/SaveBinInformation';
    
    return this._http.post(url, request).pipe(
      map((response: IBinResponse) => {        
        return response;
      })
    );
  }
  

  // public deleteBin(binId: number): Observable<IApiResponse> {
  //   return this._http.delete(`fis/deleteBin/${binId}`);
  // }
  public deleteBin(binId: number): Observable<IApDeleteResponse> {
    const url = this._url.serverUrl + 'FI/RemoveBinInformation';
    const request = 
    {
      BinID: binId
   };
   return this._http.post(url, request).pipe(
    map((response: IApDeleteResponse) => {       
      return response;
    })
  );
}
public deleteBinSetup(BnsId: number): Observable<IApDeleteResponse> {
  const url = this._url.serverUrl + 'FI/RemoveBinSetupInformation';
  const request = 
  {
    BnsId: BnsId
 };
 return this._http.post(url, request).pipe(
  map((response: IApDeleteResponse) => {       
    return response;
  })
);
}

}

