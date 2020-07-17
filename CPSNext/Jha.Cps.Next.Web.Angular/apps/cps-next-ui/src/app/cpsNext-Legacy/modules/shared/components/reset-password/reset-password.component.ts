import { Subject, Subscription } from "@node_modules/rxjs";
import { IUserPassword } from "./../../../../entities/models";
import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomValidators } from "@entities/validators";
import { AccountService } from "../../../../services/account.svc";
import { LocalModalComponent } from "@shared/components";
import { ToastrService } from "ngx-toastr";
import { ISecurityQuestionResponses } from "@app/models/securityQuestions";
import {
  LoggingService,
  InputValidationService,
  SessionService
} from "@app/services";
import { CONSTANTS } from "@entities/constants";
import { APP_KEYS } from "@app/entities/app-keys";
import Swal from "sweetalert2";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"]
})
export class ResetPasswordComponent
  implements OnInit, AfterViewInit, OnDestroy {
  public resetPasswordForm: FormGroup;
  resetPasswordState: number;
  public changingState: boolean;
  public notification: string;
  public emailSent = false;
  token = "";
  securityQuestion = "";
  userName = "";
  userId = "";
  passwordMatch = true;
  emailAddress = "";
  public newUser = true;
  meetsPasswordCriteria = true;
  public contactAdmin = false;
  public questions: ISecurityQuestionResponses;
  public resetSecurityQuestion = false;
  public IV: InputValidationService = new InputValidationService();
  public buttonTitle = "Cancel";

  errMessage = "Invalid Response!";

  @ViewChildren("message") messageQuery: QueryList<LocalModalComponent>;
  messageSubscription: Subscription;
  message: LocalModalComponent;

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _accountService: AccountService,
    private _toastr: ToastrService,
    private _log: LoggingService,
    private _sessionSvc: SessionService
  ) {}

  ngOnInit() {
    const v = this._router.url;

    this.resetPasswordState = STATE.RESET_USER_PASSWORD;
    this.passwordMatch = true;
    this.meetsPasswordCriteria = true;
    this.contactAdmin = false;
    this.notification = null;
    this.resetSecurityQuestion = false;
    this.newUser = false;
    this.buttonTitle = "Cancel";

    this._sessionSvc.clearSession();

    if (v.indexOf("/Security/ResetUserPassword/") !== -1) {
      const idx = v.lastIndexOf("/");
      this.token = v.substring(idx + 1);
      const model = { Token: this.token };
      this.isTokenValid(model);
    }

    this.notification = null;
    this.changingState = true;
    this._resetPage();
    this.changingState = false;
    this.emailSent = false;
  }

  ngAfterViewInit() {
    this.messageSubscription = this.messageQuery.changes.subscribe(
      (msgQuery: QueryList<LocalModalComponent>) => {
        this.message = msgQuery.first;
        this.messageSubscription.unsubscribe();
      }
    );
  }
  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
  }

  isTokenValid(model) {
    setTimeout(() => {
      this._accountService.isTokenValid(model).subscribe(
        response => {
          if (response && response.Data.IsRecordExist) {
            if (
              response.Data.IsRecordExist &&
              response.Data.IsResetSecurityQuestion
            ) {
              this._router.navigate(["/resetQuestion"]);
              return;
            } else if (!response || response.Data.IsTokenExpired) {
              this._toastr.error(
                CONSTANTS.sharedComponentMsgs.resetPassword.invalidMessage
              );
              this._router.navigate(["/error"]);
              return;
            }
            this.userName = response.Data.UserName;
            this.securityQuestion = response.Data.SecurityQuestion;
            // console.log('Security Question: [' + this.securityQuestion + ']');
            this.resetPasswordState = STATE.VALIDATE_SECURITY_ANSWER;
            this.userId = response.Data.UsrId.toString();
            this.newUser = response.Data.IsFirstTimeLogin;
            if (!response.Data.IsSecurityQuestionConfigured) {
              // if(response.IsFirstTimeLogin === true && !response.SecurityQuestion) {
              //get security question and create drop down
              const lst = this._accountService
                .getSecurityQuestions2()
                .subscribe(securityQuestions => {
                  this.resetPasswordState = STATE.UPDATE_SECURITY_QUESTION;
                  this.questions = securityQuestions;
                  this.resetSecurityQuestion = true;
                });
            }
          } else {
            //Issue message invalid request : bad token
            const msgs =
              "Resetting Password! " + "Link is either expired or Invalid!";
            this._log.fatal(msgs);
            this._toastr.error("Link is either expired or Invalid!");
            this._router.navigate(["/login"]);
          }
        },
        (err: any) => {
          this._log.fatal("Unable to navigate to reset password link!");
          this._router.navigate(["/error"]);
        }
      );
    }, 500);
  }
  _resetPage() {
    this.resetPasswordForm = this._fb.group({
      username: new FormControl("", [
        Validators.required,
        CustomValidators.AlphaNumericWithSelectedSpecialCharacters
      ]),
      securityquestion: new FormControl("", Validators.required),
      securityquestionList: new FormControl("", Validators.required),
      newpassword: new FormControl("", Validators.required),
      confirmpassword: new FormControl("", Validators.required),
      securityanswer: new FormControl("")
    });
  }

  onpwdResetFormSubmit(env) {
    this.passwordMatch = true;

    switch (this.resetPasswordState) {
      case STATE.RESET_USER_PASSWORD:
        this.resetUserPassword();
        break;

      case STATE.VALIDATE_SECURITY_ANSWER:
        this.validateSecurityAnswer();
        break;

      case STATE.UPDATE_SECURITY_QUESTION:
        this.updateSecurityQuestion();
        break;

      case STATE.UPDATE_USER_PASSWORD:
        this.updateUserPassword();
        break;
    }
  }

  resetUserPassword() {
    let userName: string = this.resetPasswordForm.get("username").value;
    let emailAddress = "";

    const EMAIL_REGEXP = /[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

    // const v = userName.match(EMAIL_REGEXP);
    // if (v) {
    //   emailAddress = userName;
    //   userName = "UNKNOWN";
    // }

    const bResponse = this._accountService
      .resetUserPassword(userName)
      .subscribe(response => {
        if (response) {
          this.emailSent = true;
          //this.emailSent = response.isUserExists;
          this.buttonTitle = this.emailSent ? "Ok" : "Cancel";
          this.resetPasswordState = STATE.RESET_USER_PASSWORD;
        } 
        else {
          this.emailSent = false;
          this._toastr.error(
            CONSTANTS.sharedComponentMsgs.resetPassword.invalidData
          );
        }
      });

    //const requestModel = { UserName: userName, UserEmail: emailAddress };
    // this._accountService.validateUserID(null).subscribe(response => {
    //   if (response) {
    //     this.emailSent = response.isUserExists;
    //     this.buttonTitle = this.emailSent ? "Ok" : "Cancel";
    //     this.resetPasswordState = STATE.RESET_USER_PASSWORD;
    //     if (response.isUserExists) {
    //       this._accountService
    //         .checkUserLockStatus(response.UsrId)
    //         .subscribe(res => {
    //           if (res == false) {
    //             const bResponse = this._accountService
    //               .resetUserPassword(userName)
    //               .subscribe(res => {});
    //           }
    //         });
    //     } else {
    //       this._toastr.warning(
    //         CONSTANTS.sharedComponentMsgs.resetPassword.invalidData
    //       );
    //     }
    //   }
    // });
  }

  validateSecurityAnswer() {
    const securityanswer = this.resetPasswordForm.get("securityanswer").value;

    if (securityanswer == "") {
      this._toastr.error(CONSTANTS.sharedComponentMsgs.resetPassword.invalidData);
      return;
    }
    else
    {
    const model = { UsrID: this.userId, SecurityAnswer: securityanswer };

    this._accountService
      .validateUserSecurityAnswer(model)
      .subscribe(response => {
        if (response) {
          if (response.UserLocked || response.AttemptsExceeded) {
            // Unable to reset password. please contact Administrator.
            this.notification =
              CONSTANTS.sharedComponentMsgs.resetPassword.invalidMessage;
            this.contactAdmin = true;
            this._toastr.error(this.notification);
           // this.onpwdResetFormCancel(null);
           this._router.navigate(["/login"]);
            return;
          } else if (!response.UserLocked && !response.ValidAnswer) {
            this._toastr.error(
              CONSTANTS.sharedComponentMsgs.resetPassword.invalidEntry
            );
            this.resetPasswordForm.get("securityanswer").setValue("");
            return;
          } else if (
            !response.UserLocked &&
            response.ValidAnswer &&
            !response.AttemptsExceeded
          ) {
            this.resetPasswordState = STATE.UPDATE_USER_PASSWORD;
          }
        }
      });
    }
  }

  updateUserPassword() {
    this.meetsPasswordCriteria = true;
    const newPassword = this.resetPasswordForm.get("newpassword").value;
    const confirmPassword = this.resetPasswordForm.get("confirmpassword").value;
    if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
      this.passwordMatch = false;
      return;
    }

    const changePasswordModel: IUserPassword = {
      UsrId: Number(this.userId),
      newPassword: newPassword,
      userName: this.userName
    };

    this._accountService
      .updateUserPassword(changePasswordModel)
      .subscribe(response => {
        if (response) {
          const isChanged = response.PasswordUpdated;
          if (!isChanged) {
            this.meetsPasswordCriteria = false;
            if (response.HistoryRequirementFailed) {
              this._toastr.error(
                CONSTANTS.sharedComponentMsgs.resetPassword
                  .invalidPasswordHistory
              );
              return;
            } else if (response.IsPasswordPartofUserName) {
              this._toastr.error(
                CONSTANTS.sharedComponentMsgs.resetPassword
                  .invalidPasswordwithUserName
              );
              return;
            }
            this._toastr.error(
              CONSTANTS.sharedComponentMsgs.resetPassword
                .invalidPasswordRestriction
            );
          } else {
            this._toastr.success(
              CONSTANTS.sharedComponentMsgs.resetPassword.updatePasswordSuccess
            );
            this._router.navigate(["/login"]);
            // Inform User that password has been changed.
            // Cancel. allow them to login.
          }
        }
      });
  }

  updateSecurityQuestion() {
    const securityQuestionId: string = this.resetPasswordForm.get(
      "securityquestionList"
    ).value;
    const securityanswer2 = this.resetPasswordForm.get("securityanswer").value;
    const username= this.resetPasswordForm.get("username").value;
    if(securityanswer2 == "" || securityQuestionId == ""){
      this._toastr.error(CONSTANTS.sharedComponentMsgs.resetPassword.invalidData);
    }
else{

    const model2 = {
      UsrId: this.userId,
      SeqId: securityQuestionId,
      SecurityAnswer: securityanswer2,
      UserName: username
    };

    this._accountService
      .updateUserSecurityQuestion(model2)
      .subscribe(response => {
        if (response) {
          this._toastr.success(
            CONSTANTS.sharedComponentMsgs.resetPassword.updateSecurityQuesAnswer
          );
          this.resetPasswordState = STATE.UPDATE_USER_PASSWORD;
        } else
          this._toastr.success(
            CONSTANTS.sharedComponentMsgs.resetPassword
              .failupdateSecurityQuesAnswer
          );
      });
       
}
  }

  onpwdResetFormCancel(env) {
    if(this.resetPasswordState == STATE.UPDATE_USER_PASSWORD){
      (Swal as any)
    .fire({
      title:"Confirm to cancel",
      type: "warning",
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    })
    .then(result => {
      if (result.value) {    
        this._router.navigate(["/login"]);
      } else {
        this.resetPasswordState = STATE.UPDATE_USER_PASSWORD
      }
    }); 
    }
    else{
    this._router.navigate(["/login"]);
    }
    // this.resetPasswordState = STATE.UPDATE_USER_PASSWORD;
    // this.changingState = false;
    // this.emailSent = false;
    // this.token = "";
    // this.notification = null;
    // (Swal as any)
    // .fire({
    //   title:"Are you sure to cancel",
    //   type: "warning",
    //   allowOutsideClick: false,
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes",
    //   cancelButtonText: "No"
    // })
    // .then(result => {
    //   if (result.value) {    
    //     this._router.navigate(["/login"]);
    //   } else {
    //   }
    // });   
    
  }

  onCancelClick() {
    this.notification = null;
    this.message.close();
  }

  validateEntry(env) {
    this.passwordMatch = true;
    this.meetsPasswordCriteria = true;
    const key = env.keyCode;

    const ret = true;
    return ret;
  }
}

enum STATE {
  RESET_USER_PASSWORD = 1,
  VALIDATE_SECURITY_ANSWER = 2,
  UPDATE_SECURITY_QUESTION = 3,
  UPDATE_USER_PASSWORD = 4
}
