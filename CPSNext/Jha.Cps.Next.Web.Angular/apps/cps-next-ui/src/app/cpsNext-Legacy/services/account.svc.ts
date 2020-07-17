import { IApiResponseBackend } from "./../entities/api-response";
import { ISecurityQuestionResponse } from "./../models/securityQuestions";
import { ProductContext } from "./../entities/models";
import { IsSecurityTokenValidResponse } from "./../models/issecuritytokenvalid";
import { IUserEmailResponse } from "./../models/user-email";
import { ValidateSecurityAnswerResponse } from "./../models/validatesecurityanswer";
import { UserPasswordUpdateResponse } from "./../models/userpasswordupdate";
import { UserContext } from "./../entities/user-context";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { of, Subject } from "@node_modules/rxjs";
import { HttpBaseService } from "@services/http.svc";
import { SessionService } from "@services/session.svc";
import { LoggingService } from "@services/logging.svc";
import {
  IApiResponse,
  IApiResponsePasswordUpdated,
  IApiResponsePasswordValidate
} from "@entities/api-response";
import {
  ISecurityQuestion,
  IUserDetails,
  IPassword,
  IUserPassword
} from "@entities/models";
import { APP_KEYS } from "@entities/app-keys";
import { environment } from "@env/environment";
import { UserInfo } from "@app/entities/user-info.i";
import { UserDetailContext } from "@entities/models";
import { map } from "@node_modules/rxjs/internal/operators";
import { FiContext } from "@entities/models";
import { UserAuthResponse } from "@app/models/userAuth";
import { UrlResolver } from "./url-reolver";

@Injectable()
export class AccountService {
  protected readonly CLASSNAME = "AccountService";
  public changePasswordErrors = false;

  private _UserSubs = [];
  private _loading = false;
  private serverUrl: string;

  constructor(
    private _http: HttpBaseService,
    private _sessionSvc: SessionService,
    private _url: UrlResolver,
    private _log: LoggingService
  ) {}

  public login(model: any): Observable<IApiResponse> {
    const url = this._url.serverUrl + "Auth/login";
    return this._http.post(url, model);
  }

  public validateCurrentPwd(model: any): Observable<IApiResponse> {
    return this._http.post("account/validateCurrentPwd", model);
  }
  public UpdateCurrentPwd(model: any): Observable<IApiResponsePasswordUpdated> {
    const url = this._url.serverUrl + "Auth/updateUserPassword";

    const request = {
      UsrID: model.userid,
      NewPassword: model.password,
      UserName: model.username
    };
    //return this._http.post(url, request);
    return this._http.post(url, request).pipe(
      map((response: IApiResponsePasswordUpdated) => {
        return response;
      })
    );
  }
  public ValidateChangePwd(
    model: any
  ): Observable<IApiResponsePasswordValidate> {
    const url = this._url.serverUrl + "Auth/authenticateUser";

    const request = {
      SecurityAnswer: "",
      Password: model.password,
      Username: model.username
    };
    //return this._http.post(url, request);
    return this._http.post(url, request).pipe(
      map((response: any) => {
        return response.Data;
      })
    );
  }

  public resendOtp(model: any): Observable<IApiResponse> {
    let url = this._url.serverUrl + "Auth/sendOtp";
    return this._http.post(url, model);
  }

  public loginOtp(model: any): Observable<IApiResponse> {
    const url = this._url.serverUrl + "Auth/loginOtp";
    return this._http.post(url, model);
  }

  public ping(): Observable<string> {
    // return this._http.get('account/ping');
    return this._http.get(this._url.serverUrl + "Auth/ping");
  }

  public logoff() {
    this._sessionSvc.clearSession();
  }

  public getUserContext(): Observable<IApiResponse> {
    return this._http.get("account/getUserContext");
  }

  public validateUserID(model: any): Observable<IUserEmailResponse> {
    return this._http.post(
      this._url.serverUrl + "Auth/retrieveUserEmail",
      model
    );
  }

  public checkUserLockStatus(UsrId: any): Observable<boolean> {
    const model = { UsrID: UsrId };
    const url = this._url.serverUrl + "Auth/IsUserLocked";
    return this._http.post(url, model);
  }

  public createProductUserAccount(
    user: UserDetailContext
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "Auth/createProductUserAccount";

    return this._http.post(url, user).pipe(
      map((response: IApiResponse) => {
        if (response.data) {
          let users = this._sessionSvc.get(APP_KEYS.userContext) || [],
            index = users.findIndex((u: UserDetailContext) => {
              return u.Username === response.data.Username;
            });
          if (index == -1) {
            users.splice(index, 1, response.data);
          }
          this._sessionSvc.set(APP_KEYS.userContext, users);
        }
        return response;
      })
    );
  }

  public saveProductFIConfig(
    productId: any,
    FIID: any
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "Product/saveProductFIConfig";
    const request = {
      PrdID: productId,
      FIID: FIID,
      Config_Key: "JhaCoreID",
      Config_Value: 1,
      DataType: Number,
      IsRequired: 1
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponse) => {
        if (response.data) {
          let prods = this._sessionSvc.get(APP_KEYS.cachedProducts) || [],
            index = prods.findIndex((p: ProductContext) => {
              return p.productId === response.data.PrdID;
            });
          if (index == -1) {
            prods.splice(index, 1, response.data);
          }
        }
        return response;
      })
    );
  }
  public updateProductUserAccount(
    user: UserDetailContext
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "Auth/updateProductUserAccount";

    return this._http.post(url, user).pipe(
      map((response: IApiResponse) => {
        return response;
      })
    );
  }

  public getUserAccountDetails(
    productId?: number
  ): Observable<UserDetailContext[]> {
    const url = this._url.serverUrl + "Auth/retrieveProductUserAccount";
    const request = {
      PrdID: productId,
      FIID: null
    };

    return this._http.post(url, request).pipe(
      map((response: UserDetailContext[]) => {
        if (response) {
          this._sessionSvc.set(APP_KEYS.cachedFIs, response);
        }
        return response;
      })
    );
  }

  public RetrieveFIInformationByProductId(
    prdID: number,
    UsrID: number = 0
  ): Observable<FiContext[]> {
    const url = this._url.serverUrl + "fi/RetrieveFIInformation";
    //if prdID is null mean we want to get all of products
    const request = {
      PrdID: prdID,
      UsrID: UsrID
    };

    return this._http.post(url, request).pipe(
      map((response: FiContext[]) => {
        if (response) {
          this._sessionSvc.set(APP_KEYS.cachedFIs, response);
        }
        return response;
      })
    );
  }

  public isUserExists(username: string): Observable<IApiResponseBackend> {
    const url = this._url.serverUrl + "Auth/isUserExists";
    const request = {
      UserName: username
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponseBackend) => {
        return response;
      })
    );
  }

  public changeUserLockStatus(
    username: number,
    lockstatus: boolean
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "Auth/changeUserLockStatus";
    const request = {
      UsrId: username,
      LockStatus: lockstatus
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponse) => {
        return response;
      })
    );
  }

  public changeSecondaryAuthLockStatus(
    username: number,
    MFALockStatus: boolean,
    EmailAddress: any
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "Auth/changeUserSecondaryAuthLockStatus";
    const request = {
      UsrId: username,
      IsMFALocked: MFALockStatus,
      IsMFAEnabled: false,
      MFAEnableMode: false,
      ToEmailAddress: EmailAddress
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponse) => {
        return response;
      })
    );
  }
  public getUserDetails(): Observable<IApiResponse> {
    return this._http.get("account/getUserDetails");
  }

  public getUserDetailsByUserName(username): Observable<IApiResponseBackend> {
    const url = this._url.serverUrl + "Auth/retrieveUserDetails";
    const model = { Username: username, UsrID: 0 };
    return this._http.post(url, model);
  }

  public _getUsers(callback: any = null) {
    if (this._loading) return;

    this._loading = true;
    this._UserSubs = this.getHostList();

    this._loading = false;
  }

  public deleteUserAccount(
    userid: number,
    prdID: number
  ): Observable<IApiResponse> {
    const url = this._url.serverUrl + "Auth/deleteUserAccount";
    const request = {
      UsrId: userid,
      prdID: prdID
    };
    return this._http.post(url, request).pipe(
      map((response: IApiResponse) => {
        // console.log(response);
        // let users = this._sessionSvc.get(APP_KEYS.userContext) || [];
        // let index = users.findIndex((u: UserDetailContext) => {
        //     return u.UsrID === userid;
        //   });

        // if (index == -1) {
        //   users.splice(index, 1);
        // }
        // this._sessionSvc.set(APP_KEYS.userContext, users);
        return response;
      })
    );
  }

  public deleteUser(username) {
    return "Delete successful";
  }
  public getHostList() {
    let count = 10;
    let i: number;
    const res = [];
    for (i = 0; i <= count; i++) {
      res.push(this.EachHost(i));
    }
    return res;
  }

  public EachHost = i => {
    return {
      HscID: "1000" + i,
      Name: "TestHost " + i,
      Description: "Test Description " + i,
      ContainerType: [
        "Test ContainerType " + i,
        "Test ContainerType " + i + 1,
        "Test ContainerType " + i + 2
      ],
      ServerName: "Test ServerName " + i,
      ServerIP: "10000" + i,
      AssemblyLocation: "Test AssemblyLocation " + i,
      ConfigLocation: "Test ConfigLocation " + i
    };
  };

  public getSecurityQuestions(): Observable<IApiResponse> {
    const questions = this._sessionSvc.get(APP_KEYS.securityQuestions);

    if (questions && questions.length)
      return of(<IApiResponse>{ data: questions });

    return this._http.get("account/getSecurityQuestions");

  }

  public getSecurityQuestions2(): Observable<ISecurityQuestionResponse[]> {
    const model = { SeqId: null };
    return this._http.post(
      this._url.serverUrl + "Auth/RetrieveSecurityQuestions",
      model
    );
  }

  public updateUserDetails(model: IUserDetails): Observable<IApiResponse> {
    return this._http.post("account/updateUserDetails", model);
  }

  public updateUserProfileDetails(
    model: UserDetailContext
  ): Observable<IApiResponse> {
    const newModel = {UsrID: model.UsrID, Phone: model.Phone, Extension: model.Extension,
      Phone2: model.Phone2};
     const url= this._url.serverUrl + "Auth/updateUserDetails2";
    return this._http.post(url, newModel);
  }

  public updatePassword(model: IPassword): Observable<IApiResponse> {
    return this._http.post("account/updatePassword", model);
  }

  public updateUserPassword(
    model: IUserPassword
  ): Observable<UserPasswordUpdateResponse> {
    return this._http.post(
      this._url.serverUrl + "Auth/updateUserPassword",
      model
    );
  }

  public udpateSecurityQuestion(
    model: ISecurityQuestion
  ): Observable<IApiResponse> {
    return this._http.post("account/udpateSecurityQuestion", model);
  }

  public resetUserPassword(userName: string): Observable<boolean> {
    const model = {
      Username: userName
    };
    const requestModel = { Username: userName,UpdateBy: userName  };
    const url = this._url.serverUrl + "Auth/resetUserPassword";
    return this._http.post(url, model);
  }
  public ResetUserPasswordCPSAdmin(
    UsrId: any,
    Username:any,
    UpdatedBy: any,
    emailAddress: any
  ): Observable<boolean> {
    const model = {
      UsrID: UsrId,
      Username:Username,
      UpdateBy: UpdatedBy,
      ToEmailAddress: emailAddress
    };

    const url = this._url.serverUrl + "Auth/ResetUserPasswordCPSAdmin";
    return this._http.post(url, model);
  }
  public resetUserSecurityQuestion(
    UsrId: any,
    UpdatedBy: any,
    emailAddress: any
  ): Observable<boolean> {
    const model = {
      UsrID: UsrId,
      UpdateBy: UpdatedBy,
      ToEmailAddress: emailAddress
    };

    const url = this._url.serverUrl + "Auth/resetUserSecurityQuestion";
    return this._http.post(url, model);
  }

  public resetUserPasswordGlobal(Usrname: any): Observable<IUserEmailResponse> {
    const model = { UserName: Usrname };

    const url = this._url.serverUrl + "Auth/retrieveUserEmail";
    return this._http.post(url, model);
  }

  public IsEmailExists(Usremail: any): Observable<IUserEmailResponse> {
    const model = {
      //UserName:Usrname,
      UserEmail: Usremail
    };

    const url = this._url.serverUrl + "Auth/retrieveUserEmail";
    return this._http.post(url, model);
  }

  public isTokenValid(model: any): Observable<IApiResponseBackend> {
    return this._http.post(
      this._url.serverUrl + "Auth/isSecurityTokenValid",
      model
    );
  }

  public retrieveUserSecurityQuestion(model: any) {
    const model1 = { userName: model };
    return this._http
      .post(
        this._url.serverUrl + "account/retrieveUserSecurityQuestion",
        model1
      )
      .subscribe((response: IApiResponse) => {
        // console.log('Response::: ' + response.data);
      });
  }

  public validateUserSecurityAnswer(
    model: any
  ): Observable<ValidateSecurityAnswerResponse> {
    return this._http.post(
      this._url.serverUrl + "Auth/validateUserSecurityAnswer",
      model
    );
  }

  public updateUserSecurityQuestion(model: {
    UsrId: any;
    SeqId: string;
    SecurityAnswer: string;
    UserName: string;
  }) {
    return this._http.post(
      this._url.serverUrl + "Auth/updateUserSecurityQuestion2",
      model
    );
    // return this._http.post(
    //   this._url.serverUrl + "Auth/updateUserSecurityQuestion",
    //   model
    // );
  }

  public authenticateUser(model): Observable<IApiResponseBackend> {
  //  public authenticateUser(model): Observable<UserAuthResponse> {
    return this._http.post(
      this._url.serverUrl + "Auth/authenticateUser",
      model
    );
  }
}
