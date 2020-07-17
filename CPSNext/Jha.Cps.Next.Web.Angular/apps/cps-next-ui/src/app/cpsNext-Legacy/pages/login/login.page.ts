import { VaultService } from "../../services/vault.svc";
import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChildren,
  QueryList,
  AfterViewInit
} from "@angular/core";
import { LocationStrategy } from "@angular/common";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { AccountService } from "@services/account.svc";
import { ActivatedRoute, Router } from "@angular/router";
import {
  LoggingService,
  NavigationService,
  SessionService,
  InputValidationService
} from "@app/services";
import { APP_KEYS } from "@entities/app-keys";
import { IApiResponse } from "@entities/api-response";
import { CustomValidators } from "@entities/validators";
import { CONSTANTS } from "@entities/constants";
import { environment } from "../../../../environments/environment";
import * as moment from "moment";
import { PRODUCT_IDS } from "@app/entities/product-ids";
import { LocalModalComponent } from "@shared/components";
import { Subscription } from "rxjs";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";

@Component({
  selector: "login-page",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./login.html",
  styleUrls: ["./login.scss"]
})
export class LoginPage implements OnInit, AfterViewInit {
  protected readonly CLASSNAME = "LoginPage";

  public readonly OTP_TIMEOUT = 10;

  public returnUrl = "";
  public notification = "";
  public step = 0;
  public loading = false;
  public saving = false;
  public loginForm: FormGroup;
  public otpForm: FormGroup;
  public otpResent = false;
  public remainingTimeText = "";
  public errorMessages: string[];
  public IV: InputValidationService = new InputValidationService();
  public otpError = "";

  private _remainingTime: moment.Moment = null;
  private _otpTimer: any = null;
  public otpFailedAttempts = 0;

  @ViewChildren("yesNoModal") yesNoModalQuery: QueryList<LocalModalComponent>;
  yesNoModalSubscription: Subscription;
  yesNoModal: LocalModalComponent;

  constructor(
    private _fb: FormBuilder,
    private _url: LocationStrategy,
    public _route: ActivatedRoute,
    private _router: Router,
    private _accountSvc: AccountService,
    private _navSvc: NavigationService,
    private _sessionSvc: SessionService,
    private _log: LoggingService,
    private _vault: VaultService
  ) {}

  ngOnInit() {
    this._sessionSvc.clearSession();
    this._resetPage();
    if (this.yesNoModal && this.yesNoModal.isOpen) {
      this.yesNoModal.close();
    }
    this.otpError = "";
    // this._log.fatal('Resetting Password');

    if (this._route.queryParams) {
      this._route.queryParams.subscribe(params => {
        this.returnUrl = params["returnUrl"];
        if (params["st"] === "true")
          this.notification = CONSTANTS.genericCRUDMsgs.sessionExpired;
      });
    }

    this.otpFailedAttempts = 0;
  }

  ngAfterViewInit() {
    this.yesNoModalSubscription = this.yesNoModalQuery.changes.subscribe(
      (yesNoQuery: QueryList<LocalModalComponent>) => {
        this.yesNoModal = yesNoQuery.first;
        this.yesNoModalSubscription.unsubscribe();
      }
    );
  }
  // Login Form Events
  public onUsernameKeyUp($event: any) {
    this.errorMessages = null;
    let regex = new RegExp(CONSTANTS.regex.IsAlphaNumericRegEx);
    if (!regex.test($event.target.value)) {
      this.loginForm.controls["username"].setValue(
        $event.target.value.match(regex).join()
      );
      $event.preventDefault();
    }
  }

  public onUsernameChange($event: any) {
    if (this.errorMessages && this.errorMessages.length)
      this.errorMessages = [];
  }

  public onConfirmLoginFailure(env) {
    if (this.yesNoModal.isOpen) {
      this.yesNoModal.close();
      this.otpError = "";
      // this.errorMessages = [];
    }
    this.errorMessages = [];
    this.step = 1;
    // window.location.reload();
    // this._router.navigate(['/login']);
  }

  // public onPasswordKeyUp($event: any) {
  //   let regex = new RegExp(CONSTANTS.regex.IsAlphaNumericWithSelectedSpecialCharactersRegEx);
  //   if (!regex.test($event.value)) {
  //     this.loginForm.controls['password'].setValue($event.value.match(regex).join());
  //     $event.preventDefault();
  //   }
  // }

  public onPasswordChange($event: any) {
    if (this.errorMessages && this.errorMessages.length)
      this.errorMessages = [];
  }

  public onLoginFormSubmit($event: any) {
    this.errorMessages = [];

    if (this.loginForm.valid) {
      this.loading = true;
      this._accountSvc
        .login(this.loginForm.value)
        .toPromise()
        .then((response: IApiResponse) => {
          if (response) {
            if (response.data && response.errorMessages.length === 0) {
              this._sessionSvc.set(APP_KEYS.HTTP_AUTH_TOKEN, response.value);
            }
            if (response && response.value) {
              this._sessionSvc.set(APP_KEYS.HTTP_AUTH_TOKEN, response.value);
            }
          }

          this._handleLoginResponse(response);
        })
        .catch(err => {
          this.errorMessages = [CONSTANTS.genericCRUDMsgs.loginFail];
          this.loading = false;
        });
    } else this.errorMessages = ["Please enter a valid Username and Password."];
  }

  // OTP Form Events
  public onOtpKeyUp($event: any) {
    this._log.log(`${this.CLASSNAME} > onOtpKeyUp > $event`, $event);

    let regex = new RegExp(CONSTANTS.regex.IsNumericOnlyRegEx);
    if (!regex.test($event.target.value)) {
      this.otpForm.controls["otp"].setValue(
        ($event.target.value.match(regex) || []).join()
      );
      $event.preventDefault();
    }
  }

  public onResendOtpClick() {
    this.otpResent = true;
    this._accountSvc.resendOtp(this.otpForm.value).subscribe(response => {
      if (response.errorMessages && response.errorMessages.length) {
        this.errorMessages = response.errorMessages;
        return;
      }
      this.otpForm.controls["requestKey"].setValue(response.value);
      if (response.expiration) {
        this._startOtpTimer(moment(response.expiration));
      } else {
        this._startOtpTimer(moment().add(10, "minutes"));
      }
    });
  }

  public onOtpFormSubmit($event: any) {
    if (this.otpForm.valid) {
      this.loading = true;
      this.saving = true;
      this._accountSvc
        .loginOtp(this.otpForm.value)
        .toPromise()
        .then((response: IApiResponse) => {
          if (response && response.value) {
            this._sessionSvc.set(APP_KEYS.HTTP_AUTH_TOKEN, response.value);
          }

          this.loading = false;
          this.saving = false;
          const errors = response.errorMessages.length > 0;
          const isMfaLocked = response.data.IsMFALocked;

          if (errors) {
            //otp failed.
            this.errorMessages = [response.errorMessages[0]];
            this.otpFailedAttempts++;
          }
          if (isMfaLocked) {
            //show dialog.
            this.otpError = response.errorMessages[0];
            this.yesNoModal.open();

            //Clear login form
            this.loginForm.reset();
            this.otpForm.reset();
          } else if (!errors && !isMfaLocked) {
            // no errors = successful otpLogin.
            this._accountSvc
              .getUserDetailsByUserName(response.data.username)
              .subscribe(
                rep => {
                  response.data.isJHAUser = rep.Data.IsJHAUser;
                  response.data.fiid = rep.Data.FIID;
                  this._handleLoginResponse(response);
                  this.loading = false;
                  this.saving = false;
                },
                (err: any) => {}
              );
          }
        })
        .catch(err => {
          this.otpFailedAttempts++;
          this.errorMessages = [CONSTANTS.genericCRUDMsgs.loginFail];
          this.loading = false;
          this.saving = false;
        });
    } else {
      // this.otpFailedAttempts++;
      // this.errorMessages = ["Incorrect OTP. Please enter again."];
      // this.saving = false;
    }
  }

  public onCancelClick($event: any) {
    this.errorMessages=[];
    this._resetPage();
    this.loading = false;
  }

  private _startOtpTimer = (expiration: moment.Moment) => {
    this._stopOtpTimer();

    let setText = () => {
      let diff = this._remainingTime.diff(moment());
      if (diff <= 0) {
        this.step = 3;
        this._stopOtpTimer();
      } else this.remainingTimeText = moment.utc(diff).format("mm:ss");
    };

    this._remainingTime = expiration;
    this._otpTimer = setInterval(setText.bind(this), 1000);
    setText();
  };

  private _stopOtpTimer = () => {
    if (this._otpTimer) {
      clearInterval(this._otpTimer);
      this._otpTimer = null;
    }
  };

  private _handleLoginResponse = (response: IApiResponse) => {
    if (
      response &&
      response.errorMessages &&
      response.errorMessages.length > 0
    ) {
      this.errorMessages = response.errorMessages;
      this.loading = false;
      return;
    }
    if (
      (!response.data || response.data === undefined) &&
      response.redirectTo !== "SecondaryAuthentication"
    ) {
      this.errorMessages = [CONSTANTS.genericCRUDMsgs.loginFail];
      this.loading = false;
      return;
    }

    if (response.data) {
      this.getApprovedProducts(response.data);
      this._accountSvc
        .getUserDetailsByUserName(response.data.username)
        .subscribe(
          rep => {
            response.data.isJHAUser = rep.Data.isJHAUser;
            response.data.fiid = rep.Data.fiid;
            this.loading = false;

            if (response.data.iaMFALocked || this.otpFailedAttempts >= 3) {
              this.errorMessages = [
                "Secondary Authentication locked. Please contact your administrator"
              ];
              this.loading = false;
              return;
            }
          },
          (err: any) => {
            new Object();
          }
        );

      if (response.data) {
        response.data.assginedProducts.forEach(prd => {
          for (const key in prd) {
            if (prd.hasOwnProperty("productId")) {
              PRODUCT_IDS[prd.productCode] = prd.productId;
            }
          }
        });
        this._sessionSvc.set(APP_KEYS.productIDS, PRODUCT_IDS);
      }
    }

    if (response.redirectTo && response.redirectTo.toLowerCase) {
      let redirect = response.redirectTo
        .toLowerCase()
        .replace(new RegExp(" ", "g"), "");
      switch (redirect) {
        case "dashboard":
          if (!response.data || !response.value) {
            this.errorMessages = [CONSTANTS.genericCRUDMsgs.loginFail];
            this.loading = false;
            return;
          }

          this._log.debug(
            `${this.CLASSNAME} > _handleLoginResponse > response.value: `,
            response.value
          );
          // this._log.debug(`${this.CLASSNAME} > _handleLoginResponse > response.data: `, response.data);
          this._sessionSvc.set(APP_KEYS.HTTP_AUTH_TOKEN, response.value);
          this._sessionSvc.set(APP_KEYS.userContext, response.data);

          //TODO: Add back when dynamic routing is working
          // this._navSvc.setupProductRouting();

          if (this.returnUrl) this._router.navigate([this.returnUrl]);
          else this._router.navigate(["/dashboard"]);
          break;

        case "secondaryauthentication":
          this.otpForm.controls["username"].setValue(
            this.loginForm.controls["username"].value
          );
          this.otpForm.controls["requestKey"].setValue(response.value);

          if (response.expiration) {
            this._startOtpTimer(moment(response.expiration));
            this.step = 2;
          } else {
            this.errorMessages = [CONSTANTS.genericCRUDMsgs.loginFail];
          }
          break;
      }
    }
  };

  private getApprovedProducts(data: any) {
    this._vault.remove("assessableProducts");
    let prod2List = "";

    data.assginedProducts.forEach(element => {
      prod2List = prod2List + element.productId + "|";
    });

    this._vault.set("assessableProducts", prod2List);
  }

  private _resetPage = () => {
    this._stopOtpTimer();

    this.otpResent = false;
    this.notification = "";

    if (this._route.queryParams) {
      this._route.queryParams.subscribe(params => {
        this.returnUrl = params["returnUrl"];
      });
    }

    this.loginForm = this._fb.group({
      username: new FormControl("", [
        Validators.required,
        CustomValidators.AlphaNumericWithSelectedSpecialCharacters
      ]),
      password: new FormControl("", Validators.required)
    });

    this.otpForm = this._fb.group({
      username: new FormControl("", [
        Validators.required,
        CustomValidators.AlphaNumericWithSelectedSpecialCharacters
      ]),
      otp: new FormControl("", Validators.required),
      requestKey: new FormControl("", Validators.required)
    });

    this.step = 1;

    // this._accountSvc.ping().subscribe(response => {
    //   if(!response || !response.length) {
    //     this._router.navigate['/error'];
    //   }
    // });

    //DEBUG: For Testing Only.
    try {
      this.loginForm.controls["username"].setValue(environment.login.username);
      this.loginForm.controls["password"].setValue(environment.login.password);
    } catch (err) {}
  };
  resetPassword(env) {
    // this._router.navigate(['/forgotPassword']);
    this._router.navigate(["/resetPassword"]);
  }
}
