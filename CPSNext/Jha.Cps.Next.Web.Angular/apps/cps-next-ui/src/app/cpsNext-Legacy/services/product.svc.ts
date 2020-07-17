import { Injectable } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { map } from "@node_modules/rxjs/internal/operators";
import { HttpBaseService } from "@services/http.svc";
import { SessionService } from "@services/session.svc";
import {
  IApiResponse,
  IApiResponseBackend,
  IApDeleteResponse
} from "@entities/api-response";
import {
  FiContext,
  IConfigItem,
  IProductActivitySearch,
  IProductVersion,
  IProductVersionNote,
  ProductContext,
  IProductRTPActivitySearch,
  UserDetailContext,
  IConfigItemBackend,
  ServiceHostContext,
  ServiceInstanceContext,
  ServiceConfigurationContext,
  ICardFeeRate,
  ICardFeeRateUpdateResponse,
  ISearchRTPTxnDetailRequest,
  ICardICA,
  LoadFileContentResponse,
  saveFileContent,
  ProductMenuFeature
} from "@entities/models";
import { APP_KEYS } from "@entities/app-keys";
import { environment } from "@env/environment";
import { MasterCardRateContext } from "@app/models/mastercardFeeRate";
import * as _ from "lodash";
import { UrlResolver } from "./url-reolver";
import { VaultService } from "./vault.svc";

@Injectable()
export class ProductService {
  protected readonly CLASSNAME = "ProductService";

  private _loading = false;
  private _productSubs = [];
  private serverUrl: string;

  constructor(
    private _http: HttpBaseService,
    private _sessionSvc: SessionService,
    private _url: UrlResolver,
    private _vault: VaultService
  ) {
    this._sessionSvc.remove(APP_KEYS.cachedProducts);
    this._sessionSvc.remove(APP_KEYS.cachedProductVersions);
  }
  public getUsersNew(): Observable<UserDetailContext[]> {
    const subject = new Subject<UserDetailContext[]>();
    this._productSubs.push(subject);
    this._getusersnew();

    return subject;
  }
  public getProducts(): Observable<ProductContext[]> {
    const subject = new Subject<ProductContext[]>();
    this._productSubs.push(subject);
    this._getProducts();

    return subject;
  }

  public getProduct(productId: number): Observable<ProductContext> {
    const products = this._sessionSvc.get(APP_KEYS.cachedProducts),
      subject = new Subject<ProductContext>();

    if (products && products.length) {
      const product = products.find((p: ProductContext) => {
        return p.productId === productId;
      });
      setTimeout(() => {
        subject.next(product);
      }, 1);
    } else
      this._getProducts((products: ProductContext[] = []) => {
        const product = products.find((p: ProductContext) => {
          return p.productId === productId;
        });
        subject.next(product);
      });

    return subject;
  }

  public saveProduct(product: ProductContext): Observable<IApiResponse> {
    return this._http.post("products/saveProduct", product).pipe(
      map((response: IApiResponse) => {
        if (response.data) {
          const assignedUserProducts = this._sessionSvc.get(
            APP_KEYS.userContext
          );
          let aP = assignedUserProducts.assginedProducts;
          const products = this._sessionSvc.get(APP_KEYS.cachedProducts) || [],
            index = products.findIndex((p: ProductContext) => {
              return p.productId === response.data.productId;
            });
          if (index == -1) {
            response.data.displayOrder =
              assignedUserProducts.assginedProducts.length;
            products.splice(index, 1, response.data);
          } else {
            products.splice(index, 1, response.data);
          }
          if (assignedUserProducts && assignedUserProducts.assginedProducts) {
            if (
              assignedUserProducts.isSysAdmin ||
              (!assignedUserProducts.isSysAdmin && response.data.isOffered)
            ) {
              let index1 = aP.findIndex((p: ProductContext) => {
                return p.productId === response.data.productId;
              });
              if (index1 == -1) {
                aP.splice(index1, 1, response.data);
              } else {
                aP.splice(index1, 1, response.data);
              }
              assignedUserProducts.assginedProducts = aP;
              assignedUserProducts.assginedProducts = _.sortBy(
                assignedUserProducts.assginedProducts,
                "displayOrder"
              );
              // set new product in assgined session
              this._sessionSvc.set(APP_KEYS.userContext, assignedUserProducts);
              let prod2List = "";
              assignedUserProducts.assginedProducts.forEach(element => {
                prod2List = prod2List + element.productId + "|";
              });
              this._vault.set("assessableProducts", prod2List);
            }
          }
          this._sessionSvc.set(APP_KEYS.cachedProducts, products);
        }
        return response;
      })
    );
  }

  public updateDisplayOrderForUserProduct(
    product
  ): Observable<IApiResponseBackend> {
    const url =
      this._url.serverUrl + "Product/updateDisplayOrderForUserProduct";
    return this._http.post(url, product).pipe(
      map((response: IApiResponseBackend) => {
        return response;
      })
    );
  }

  public deleteProduct(productId: number): Observable<IApiResponse> {
    return this._http.delete(`products/deleteProduct/${productId}`).pipe(
      map((response: IApiResponse) => {
        const assignedUserProducts = this._sessionSvc.get(APP_KEYS.userContext);
        let aP = assignedUserProducts.assginedProducts;

        const products = this._sessionSvc.get(APP_KEYS.cachedProducts) || [],
          index = products.findIndex((p: ProductContext) => {
            return p.productId === response.data.productId;
          });

        if (index === -1) {
          products.splice(index, 1);
        }
        if (assignedUserProducts && assignedUserProducts.assginedProducts) {
          let index1 = aP.findIndex((p: ProductContext) => {
            return p.productId === response.data.productId;
          });
          if (index1 === -1) {
            aP.splice(index1, 1);
          }
          assignedUserProducts.assginedProducts = aP;
          assignedUserProducts.assginedProducts = _.sortBy(
            assignedUserProducts.assginedProducts,
            "displayOrder"
          );
          this._sessionSvc.set(APP_KEYS.userContext, assignedUserProducts);
          let prod2List = "";
          assignedUserProducts.assginedProducts.forEach(element => {
            prod2List = prod2List + element.productId + "|";
          });
          this._vault.set("assessableProducts", prod2List);
        }
        this._sessionSvc.set(APP_KEYS.cachedProducts, products);
        return response;
      })
    );
  }

  public getProductMenuFeature(): Observable<IApiResponseBackend> {
    return this._http.post(
      this._url.serverUrl + `Product/retrieveMenuFeature/`,
      {}
    );
  }

  // Product Versions & Notes

  public getProductVersions(productId: number): Observable<IApiResponse> {
    return this._http.get(`products/getProductVersions/${productId}`);
  }

  public saveProductVersion(
    productVerion: IProductVersion
  ): Observable<IApiResponse> {
    return this._http.post("products/saveProductVersion", productVerion);
  }

  public deleteProductVersion(versionId: number): Observable<IApiResponse> {
    return this._http.delete(`products/deleteProductVersion/${versionId}`);
  }

  public saveVersionNote(note: IProductVersionNote): Observable<IApiResponse> {
    return this._http.post(`products/saveVersionNote`, note);
  }

  public saveMainVersionNote(
    versionid: number,
    versionnote: string
  ): Observable<IApiResponse> {
    return this._http.post(`products/saveVersionNote`, versionnote);
  }

  public deleteVersionNote(noteId: number): Observable<IApiResponse> {
    return this._http.delete(`products/deleteVersionNote/${noteId}`);
  }

  // Configs

  public getConfig(configId: number): Observable<IApiResponse> {
    return this._http.get(`products/getConfig/${configId}`);
  }

  public getConfigs(productId: number): Observable<IApiResponse> {
    return this._http.get(`products/getConfigs/${productId}`);
  }

  public getFiConfigs(
    productId: number,
    fiId: number
  ): Observable<IApiResponse> {
    return this._http.get(`products/getFiConfigs/${productId}/${fiId}`);
  }

  public getProductConfigParameter(
    productId: number,
    pcID: number
  ): Observable<IApiResponseBackend> {
    const request = {
      PCID: pcID,
      PrdID: productId
    };
    const url = this._url.serverUrl + "Product/retrieveProductConfigParameters";
    return this._http.post(url, request);
  }

  public saveConfig(config: IConfigItem): Observable<IApiResponse> {
    return this._http.post(`products/saveConfig`, config);
  }

  public saveUpdateConfigBackend(
    config: IConfigItemBackend
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + `Product/saveProductConfig`;
    return this._http.post(url, config);
  }

  public deleteConfig(configId: number): Observable<IApiResponse> {
    return this._http.delete(`products/deleteConfig/${configId}`);
  }

  public deleteProductConfig(
    pcId: number,
    prdId: number
  ): Observable<IApiResponseBackend> {
    const request = {
      PCID: pcId,
      PRDID: prdId
    };
    const url = this._url.serverUrl + `Product/deleteProductConfig`;
    return this._http.post(url, request);
  }

  // Product FIs

  public getProductFIs(productId: number = null): Observable<IApiResponse> {
    return this._http.get(`products/getProductFIs/${productId}`).pipe(
      map((response: IApiResponse) => {
        if (response.data && response.data.length)
          this._sessionSvc.set(APP_KEYS.cachedFIs, response.data);

        return response;
      })
    );
  }

  public getProductRtpFIs(
    productId: number = null,
    UsrID: number = null,
    AdminAccess: boolean = null
  ): Observable<IApiResponseBackend> {
    const request = {
      PrdID: productId,
      UsrID: UsrID,
      AdminAccess: AdminAccess
    };
    const url = this._url.serverUrl + "Fi/RetrieveFIRTPInformation";
    return this._http.post(url, request).pipe(
      map((response: IApiResponseBackend) => {
        return response;
      })
    );
  }
  //Retrieve product list for selected FI
  public RetrieveProduct(
    productId: number = null,
    SelectedFIID: number
  ): Observable<IApiResponseBackend> {
    const url = this._url.serverUrl + "Product/retrieveProduct";
    const request = {
      PrdID: productId,
      FIID: SelectedFIID
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponseBackend) => {
        if (response)
          //this._sessionSvc.set(APP_KEYS.cachedFIs, response.data);

          return response;
      })
    );
  }

  public getProductList(
    productId: number = null,
    SelectedFIID: number = null
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "Product/getProductList";
    const request = {
      PrdID: productId,
      FIID: SelectedFIID
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponse) => {
        return response;
      })
    );
  }

  public getRtpProductStatsCount(
    productId: number = null
  ): Observable<IApiResponseBackend> {
    const url = this._url.serverUrl + "Product/RetrieveProductStats";
    const request = {
      PrdID: productId
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponseBackend) => {
        if (response.Data)
          this._sessionSvc.set(APP_KEYS.cachedRtpProductStats, response);

        return response;
      })
    );
  }

  public retrieveContainerTypes(): Observable<ServiceHostContext[]> {
    const url = this._url.serverUrl + "Product/retrieveContainerTypes";
    const request = {
      //PrdID: productId
    };
    return this._http.post(url, request).pipe(
      map((response: ServiceHostContext[]) => {
        if (response) {
          this._sessionSvc.set(APP_KEYS.cachedFIs, response);
        }
        return response;
      })
    );
  }

  public retrieveFileContent(
    FilePath,
    User,
    serverName,
    serverIP
  ): Observable<LoadFileContentResponse> {
    const url = this._url.serverUrl + "Product/retrieveFileContent";
    const request = {
      FilePath: FilePath,
      User: User,
      ServerName: serverName,
      ServerIP: serverIP
    };
    return this._http.post(url, request).pipe(
      map((response: LoadFileContentResponse) => {
        return response;
      })
    );
  }

  public retrieveDatCenterSites(): Observable<ServiceHostContext[]> {
    const url = this._url.serverUrl + "Product/retrieveDataCenterSites";
    const request = {
      //PrdID: productId
    };
    return this._http.post(url, request).pipe(
      map((response: ServiceHostContext[]) => {
        if (response) {
          this._sessionSvc.set(APP_KEYS.cachedFIs, response);
        }
        return response;
      })
    );
  }

  public retrieveDictionaryData(
    KeyValue: string
  ): Observable<ServiceHostContext[]> {
    const url = this._url.serverUrl + "Product/retrieveDictionaryData";
    let KeyName: string;

    KeyName = KeyValue;

    if (KeyValue == "Status") {
      KeyName = "HostContainerInstallStatus";
    }
    if (KeyValue == "MessagingTransformType") {
      KeyName = "MessagingTransformType";
    }
    if (KeyValue == "MessagingSettingFile") {
      KeyName = "MessagingSettingFile";
    }
    if (KeyValue == "IsoSpecification") {
      KeyName = "IsoSpecification";
    }
    if (KeyValue == "ApplicationModule") {
      KeyName = "ApplicationModule";
    }
    if (KeyValue == "ServiceChannelType") {
      KeyName = "ServiceChannelType";
    }

    const request = {
      DictKeyName: KeyName
    };
    return this._http.post(url, request).pipe(
      map((response: ServiceHostContext[]) => {
        if (response) {
          this._sessionSvc.set(APP_KEYS.cachedFIs, response);
        }
        return response;
      })
    );
  }

  public retrieveConfigTemplateData(): Observable<ServiceHostContext[]> {
    const url = this._url.serverUrl + "Product/retrieveConfigTemplateData";
    const request = {
      //PrdID: productId
    };
    return this._http.post(url, request).pipe(
      map((response: ServiceHostContext[]) => {
        if (response) {
          this._sessionSvc.set(APP_KEYS.cachedFIs, response);
        }
        return response;
      })
    );
  }

  public saveServiceHost(
    servicehost: ServiceHostContext
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "product/saveServiceHost";

    return this._http.post(url, servicehost).pipe(
      map((response: IApiResponse) => {
        return response;
      })
    );
  }

  public saveFileContent(
    fileContent: saveFileContent
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "product/saveFileContent";

    return this._http.post(url, fileContent).pipe(
      map((response: IApiResponse) => {
        return response;
      })
    );
  }

  public saveServiceInstance(
    serviceinstance: ServiceInstanceContext
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "product/saveServiceInstance";

    return this._http.post(url, serviceinstance).pipe(
      map((response: IApiResponse) => {
        return response;
      })
    );
  }

  public RestartServiceInstance(
    ServiceinstanceId: number,
    Command: string,
    UpdateBy: string
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "product/saveServiceInstance";

    const request = {
      SviID: ServiceinstanceId,
      Command: Command,
      isRestartProcess: true,
      UpdateBy: UpdateBy
    };

    return this._http.post(url, request).pipe(
      map((response: IApiResponse) => {
        return response;
      })
    );
  }

  public saveServiceConfig(
    serviceconfigure: ServiceConfigurationContext
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "product/saveServiceConfig";

    return this._http.post(url, serviceconfigure).pipe(
      map((response: IApiResponse) => {
        return response;
      })
    );
  }

  public removeServiceHost(
    ServiceHostId: number
  ): Observable<IApDeleteResponse> {
    const url = this._url.serverUrl + "product/removeServiceHost";
    const request = {
      HscID: ServiceHostId
    };
    return this._http.post(url, request).pipe(
      map((response: IApDeleteResponse) => {
        // let hosts = this._sessionSvc.get(APP_KEYS.serviceHostContext) || [],
        //   index = hosts.findIndex((u: ServiceHostContext) => {
        //     return u.HscID === response.data.HscID;
        //   });

        // if (index == -1) {
        //   hosts.splice(index, 1);
        // }
        // this._sessionSvc.set(APP_KEYS.serviceHostContext, hosts);
        return response;
      })
    );
  }

  public removeServiceInstance(
    ServiceInstanceId: number
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "product/removeServiceInstance";
    const request = {
      SviID: ServiceInstanceId
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponse) => {
        const instances =
            this._sessionSvc.get(APP_KEYS.serviceInstaceContext) || [],
          index = instances.findIndex((u: ServiceInstanceContext) => {
            return u.HscID === response.data.HscID;
          });

        if (index == -1) {
          instances.splice(index, 1);
        }
        this._sessionSvc.set(APP_KEYS.serviceHostContext, instances);
        return response;
      })
    );
  }

  public removeServiceConfiguration(
    ServiceConfigurationId: number
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "product/removeServiceConfig";
    const request = {
      SvcCfgID: ServiceConfigurationId
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponse) => {
        const configuration =
            this._sessionSvc.get(APP_KEYS.serviceInstaceContext) || [],
          index = configuration.findIndex((sc: ServiceConfigurationContext) => {
            return sc.SvcCfgID === response.data.SvcCfgID;
          });

        if (index === -1) {
          configuration.splice(index, 1);
        }
        // this._sessionSvc.set(APP_KEYS.serviceHostContext, configuration);
        return response;
      })
    );
  }

  public RetrieveServiceHosts(): Observable<ServiceHostContext[]> {
    const url = this._url.serverUrl + "product/retrieveServiceHosts";
    const request = {
      //PrdID: productId
    };
    return this._http.post(url, request).pipe(
      map((response: ServiceHostContext[]) => {
        if (response) {
          this._sessionSvc.set(APP_KEYS.cachedFIs, response);
        }
        return response;
      })
    );
  }

  public retrieveServiceConfig(): Observable<ServiceConfigurationContext[]> {
    const url = this._url.serverUrl + "product/retrieveServiceConfig";
    const request = {
      //PrdID: productId
    };
    return this._http.post(url, request).pipe(
      map((response: ServiceConfigurationContext[]) => {
        if (response) {
          this._sessionSvc.set(APP_KEYS.cachedFIs, response);
        }
        return response;
      })
    );
  }

  public RetrieveServiceInstances(
    productId
  ): Observable<ServiceInstanceContext[]> {
    const url = this._url.serverUrl + "product/retrieveServiceInstances";
    const request = {
      PrdID: productId
    };
    return this._http.post(url, request).pipe(
      map((response: ServiceInstanceContext[]) => {
        if (response) {
          // this._sessionSvc.set(APP_KEYS.cachedFIs, response);
        }
        return response;
      })
    );
  }

  public getFiLiveStatus(
    productId: number,
    fiId = null
  ): Observable<IApiResponse> {
    return this._http.get(`products/getFiLiveStatus/${productId}/${fiId}`);
  }

  public retrieveFILiveStatus(
    productId: number,
    fiId: number
  ): Observable<IApiResponse> {
    return this._http
      .get(`products/retrieveFILiveStatus/${productId}/${fiId}`)
      .pipe(
        map((response: IApiResponse) => {
          return response;
        })
      );
  }

  public addUpdateFIProductMapping(
    productId: number,
    fiId: number,
    updateStatus: boolean,
    goLiveComment: string,
    userId: string
  ): Observable<string> {
    const model = {
      PrdID: productId,
      FIID: fiId,
      IsEnabled: updateStatus,
      Notes: goLiveComment,
      CreateBy: userId
    };
    const url = this._url.serverUrl + `Product/updateFILiveStatus`;
    return this._http.post(url, model);

    // return this._http.post();
    // return this._http.get(`products/addUpdateFIProductMapping/${productId}/${fiId}/${updateStatus}/${goLiveComment}`).pipe(
    //   map((response: IApiResponse) => {
    //     const msg = response.data.message;
    //     return response;
    //   })
    // );
  }

  public onBoardFiProduct(
    productId: number,
    fiId: number
  ): Observable<IApiResponse> {
    return this._http
      .get(`products/onBoardFiProduct/${productId}/${fiId}`)
      .pipe(
        map((response: IApiResponse) => {
          if (response.data) {
            const items = this._sessionSvc.get(APP_KEYS.cachedFIs),
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

  public offBoardFiProduct(
    productId: number,
    fiId: number
  ): Observable<IApiResponse> {
    return this._http
      .delete(`products/offBoardFiProduct/${productId}/${fiId}`)
      .pipe(
        map((response: IApiResponse) => {
          if (response.errorMessages && response.errorMessages.length)
            return response;

          const items = this._sessionSvc.get(APP_KEYS.cachedFIs),
            index = items.findIndex((f: FiContext) => {
              return f.fiId === fiId;
            });

          if (index >= 0) {
            items.splice(index, 1);
            this._sessionSvc.set(APP_KEYS.cachedFIs, items);
          }

          return response;
        })
      );
  }

  public getMastercardFeeRates(): Observable<ICardFeeRate[]> {
    const url = this._url.serverUrl + "Product/retrieveQmrCardRates";
    return this._http.post(url, { RateID: 0 });
  }
  public getICAMaintenance(): Observable<ICardICA[]> {
    const url = this._url.serverUrl + "Product/retrieveQmrCardICA";
    return this._http.post(url, { ICAID: 0 });
  }

  public saveMastercardFeeRates(
    model: any
  ): Observable<ICardFeeRateUpdateResponse> {
    const url = this._url.serverUrl + "Product/saveQmrCardRate";
    return this._http.post(url, model);
  }
  public saveICAMaintenance(
    model: any
  ): Observable<ICardFeeRateUpdateResponse> {
    const url = this._url.serverUrl + "Product/saveQmrCardICA";
    return this._http.post(url, model);
  }
  public updateICAMaintenance(
    model: any
  ): Observable<ICardFeeRateUpdateResponse> {
    const url = this._url.serverUrl + "Product/updateQmrCardICA";
    return this._http.post(url, model);
  }
  public deleteICA(ICAID: number): Observable<IApiResponse> {
    const url = this._url.serverUrl + `Product/deleteICA`;
    const body = { ICAID: ICAID };
    return this._http.post(url, body);
  }
  // Activity Search

  public getServiceIDs(productId: number): Observable<IApiResponse> {
    return this._http.get(`products/getServiceIDs/${productId}`);
  }

  public searchServiceActivity(
    model: IProductActivitySearch
  ): Observable<IApiResponse> {
    return this._http.post("products/searchServiceActivity", model);
  }

  public searchTransactionActivity(
    model: IProductActivitySearch
  ): Observable<IApiResponse> {
    //as part of moving client api logic
    return this._http.post("products/searchTransactionActivity", model);
    // const url = this._url.serverUrl + 'product/SearchProductLogFiles'
    // return this._http.post(url, model);
  }

  public searchRTPTransactionActivity(
    model: IProductActivitySearch
  ): Observable<IApiResponseBackend> {
    const backendModel: IProductRTPActivitySearch = {
      Bin: model.bin,
      Pan: model.pan,
      SearchEndDate: model.endDate,
      SearchStartDate: model.startDate,
      ServiceId: model.serviceId,
      SearchType: model.searchType,
      FiId: model.fiId
    };
    const url = this._url.serverUrl + "product/SearchRTPProductLogFiles";
    return this._http.post(url, backendModel);
  }

  public searchRTPTransactionActivityDetails(
    model: ISearchRTPTxnDetailRequest
  ): Observable<IApiResponseBackend> {
    const url = this._url.serverUrl + "product/RetriveRtpTransDetail";
    return this._http.post(url, model);
  }

  public _getProducts(callback: any = null) {
    if (this._loading) return;
    this._loading = true;
    
    const url = this._url.serverUrl + "product/retrieveProduct2";
    this._http.post(url, null).subscribe(

    // this._http.post("products/getProducts", null).subscribe(
      (response: IApiResponseBackend) => {
        response.Data = response.Data || [];

        this._evalProducts(response.Data);
        const assignedUserProducts = this._sessionSvc.get(APP_KEYS.userContext);
        if (assignedUserProducts && assignedUserProducts.assginedProducts) {
          assignedUserProducts.assginedProducts.forEach(elem => {
            response.Data.forEach(prods => {
              if (elem.productId === prods.productId) {
                prods.displayOrder = elem.displayOrder;
              }
            });
          });
        }
        response.Data = _.sortBy(response.Data, "displayOrder");
        this._sessionSvc.set(APP_KEYS.cachedProducts, response.Data);

        if (callback) {
          callback([...response.Data]);
        } else {
          this._productSubs.forEach((sub: Subject<ProductContext[]>) => {
            sub.next([...response.Data]);
          });
        }

        this._loading = false;
      },
      err => {
        this._loading = false;
      }
    );
  }

  getCamelCaseProductName(productName: string): string {
    const initialWord = productName
      .substring(0, productName.indexOf(" "))
      .toLowerCase();
    const prdLastName = productName
      .substring(productName.indexOf(" "))
      .trim()
      .replace(" ", "");

    return initialWord + prdLastName;
  }

  public _getusersnew(callback: any = null) {
    if (this._loading) return;

    //this._log.debug(`${this.CLASSNAME} > _getProducts()`);

    this._loading = true;
    this._http.get("account/getUsersNew").subscribe(
      (response: IApiResponse) => {
        response.data = response.data || [];

        // this._evalProducts(response.data);
        //  this._sessionSvc.set(APP_KEYS.cachedProducts, response.data);

        if (callback) {
          callback([...response.data]);
        } else {
          this._productSubs.forEach((sub: Subject<UserDetailContext[]>) => {
            sub.next([...response.data]);
          });
        }

        this._loading = false;
      },
      err => {
        this._loading = false;
      }
    );
  }

  private _evalProducts = (products: ProductContext[]) => {
    if (!products || !products.length) return products;

    products.forEach((p: ProductContext) => {
      if (p.productName && p.productName.toLowerCase) {
        p.routeName = p.productName
          .toLowerCase()
          .replace(new RegExp(" ", "g"), "");
      }

      if (p.prefix && p.prefix.toLowerCase) {
        p.mainCssClass = p.prefix.toLowerCase();
        p.bigImageCssClass = p.mainCssClass + "-bg";
      }
    });
  };

  // public getProducts(): Observable<ProductContext[] | string[]> {
  //   let products = this._sessionSvc.get(APP_KEYS.cachedProducts);
  //
  //   if (products && products.length)
  //     return of(products);
  //
  //   return this._http.get('dashboard/getProducts').pipe(
  //     map((response: IApiResponse) => {
  //       if (response.data && response.data.length) {
  //         this._sessionSvc.set(APP_KEYS.cachedProducts, response.data);
  //         return response.data;
  //       }
  //
  //       if (response.errorMessages && response.errorMessages.length) {
  //         this._sessionSvc.remove(APP_KEYS.cachedProducts);
  //         return response.errorMessages;
  //       }
  //     })
  //   );
  // }
  //
  // public getProduct(): Observable<ProductContext> {
  //   let products = this._sessionSvc.get(APP_KEYS.cachedProducts) || [],
  //     product = products.find((p: ProductContext) => {
  //       p.productId === PRODUCT_IDS.CRDMNT;
  //     });
  //
  //   if (product)
  //     return of(product);
  //
  //   return this._http.get('dashboard/getProducts').pipe(
  //     map((response: IApiResponse) => {
  //       if (response.data && response.data.length) {
  //         this._sessionSvc.set(APP_KEYS.cachedProducts, response.data);
  //         return response.data;
  //       }
  //
  //       if (response.errorMessages && response.errorMessages.length) {
  //         this._sessionSvc.remove(APP_KEYS.cachedProducts);
  //         return response.errorMessages;
  //       }
  //     })
  //   );
  // }
  isRoleAdmin(prodId: string): boolean {
    const userContext = this._sessionSvc.get(APP_KEYS.userContext);
    if (userContext && userContext.assginedProducts) {
      let products = _.filter(
        userContext.assginedProducts,
        prod => prod.productId === prodId
      );
      if (products.length) {
        return products[0].role === "Admin";
      }
    }
    return false;
  }
}
