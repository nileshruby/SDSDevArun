import { IApiResponseBackend } from './../../entities/api-response';
// import { UserContext } from './../../entities/user-context';
import {Component, OnInit, ViewEncapsulation} from '@angular/core';

import {ToastrService} from '@node_modules/ngx-toastr';

import {IUserDetails} from '@entities/models';
import {AccountService, BroadcastService, LoggingService} from '@app/services';
import {APP_KEYS} from '@entities/app-keys';
import {IApiResponse} from '@entities/api-response';
import {CONSTANTS} from '@entities/constants';
import { SessionService } from '@app/services';
import {UserContext} from '@entities/user-context';


@Component({
  selector: 'profile-page',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})

export class ProfilePage implements OnInit {
  protected readonly CLASSNAME = 'ProfilePage';
  public _userContext: UserContext = null;

  public userDetails: IUserDetails;
  
  constructor(private _accountSvc: AccountService,
              private _broadcaster: BroadcastService,
              private _toastr: ToastrService,
              private _log: LoggingService,
              private _sessionSvc: SessionService) {
  }

  ngOnInit() {
    this.userDetails  = {userId: 1, username: '', firstName:'', lastName:'', email:'', phone:'',
        phoneAlt:'', questionId:1, question:'', answer:'', extension:'' };
    this._getUserDetails();
  }

  public onSaveDetails(data: any) {
    this._accountSvc.updateUserDetails(data).subscribe(this._handleSave,this._handleSaveError);
  }

  public onSvePassword(data: any) {
   // this._accountSvc.updatePassword(data).subscribe(this._handleSave,this._handleSaveError);
    this._accountSvc.UpdateCurrentPwd(data).subscribe();
    
  }

  public onSaveSecQuestion(data: any) {
    const data2 =   data;
    data.Text = this._userContext.userId;

    const model = { UsrId: this._userContext.userId, UserName: this._userContext.username,
                  SeqId: data.questionId, SecurityAnswer: data.answer};
    this._accountSvc.updateUserSecurityQuestion(model).subscribe(this._handleSave,this._handleSaveError);
    // this._accountSvc.udpateSecurityQuestion(data).subscribe(this._handleSave,this._handleSaveError);
  }

  private _getUserDetails() {
    this._userContext = this._sessionSvc.get(APP_KEYS.userContext);
    // console.log('OUTPUT::: ' + t);
    this._accountSvc.getUserDetailsByUserName(this._userContext.username).subscribe( res =>
      {
        const returnItem: IApiResponse = {
          data: {},
          errorMessages:[], expiration: new Date, flags:[]};

        returnItem.data.userId = res.Data.UsrID;
        returnItem.data.phone = (res.Data.Phone) ? res.Data.Phone : '';
        returnItem.data.phoneAlt = (res.Data.Phone2) ? res.Data.Phone2 : '';
        returnItem.data.phone2 = (res.Data.Phone2) ? res.Data.Phone2 : '';
        returnItem.data.extension = (res.Data.Extension) ? res.Data.Extension : '';
        // returnItem.data.userID = res.Data.UsrId;
        returnItem.data.username = res.Data.Username;
        returnItem.data.answer = res.Data.SecurityAnswer;
        returnItem.data.email = res.Data.Email;
        returnItem.data.firstName = res.Data.FirstName;
        returnItem.data.lastName = res.Data.LastName;
        returnItem.data.question = res.Data.Question;

        returnItem.data.questionId = res.Data.SeqID;

        returnItem.data.answer = res.Data.Answer;
        returnItem.errorMessages = res.ErrorMessages;
        returnItem.expiration = res.Expiration;
        returnItem.flags = res.Flags;
        returnItem.redirectTo = res.RedirectTo;
        returnItem.statusCode = res.StatusCode;
        returnItem.value = res.Value;

        this.userDetails = returnItem.data;
      
      }
    );

    // The code below is commented because it calls the client API and returns data that is persistant with the last 
    // user to access this page. not the current user. The above code retrieves data from the Service API.

    // this._accountSvc.getUserDetails().subscribe(
    //   response => {
    //     if (response.data && response.data.userId) {
    //          response.data.phone = (response.data.phone) ? response.data.phone : '';
    //          response.data.phoneAlt = (response.data.phoneAlt) ? response.data.phoneAlt : '';
    //          response.data.extension = (response.data.extension) ? response.data.extension : '';
    //       this.userDetails = response.data;
    //     }
    //   }
    // );
  }

  private _handleSave = (response: IApiResponse) => {
    if (response.errorMessages) {
      this._broadcaster.broadcast(APP_KEYS.onProfileEdit, APP_KEYS.profileSaveError);
      response.errorMessages.forEach((msg:string)=>{
        this._toastr.error(msg);
      });
    }
    
    this._broadcaster.broadcast(APP_KEYS.onProfileEdit, '');
    if (response && response.errorMessages && response.errorMessages.length ) {
        this._toastr.error(CONSTANTS.genericCRUDMsgs.validationRules);
        this._accountSvc.changePasswordErrors = false;
    } else{
       this._toastr.success(CONSTANTS.genericCRUDMsgs.saveSuccess);
       this._accountSvc.changePasswordErrors = true;
    }

    if (response.data && response.data.userId)
      this.userDetails = response.data;
  }

  private _handleSaveError = (response: IApiResponse) => {
    this._broadcaster.broadcast(APP_KEYS.onProfileEdit, '');
    this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
  }
}
