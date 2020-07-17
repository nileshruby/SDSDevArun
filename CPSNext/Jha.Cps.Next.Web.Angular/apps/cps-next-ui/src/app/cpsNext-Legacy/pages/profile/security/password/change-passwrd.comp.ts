import { CONSTANTS } from '@entities/constants';
import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {IApiResponse,IApiResponsePasswordUpdated} from '@entities/api-response';
import {AccountService,BroadcastService, LoggingService, InputValidationService} from '@app/services';
import {IPassword} from '@entities/models';
import {IUserDetails} from '@entities/models';
import {APP_KEYS} from '@entities/app-keys';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'profile-password',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './change-passwrd.html',
  styleUrls: ['./change-passwrd.scss']
})

export class ProfilePasswordComponent implements OnInit {
  protected readonly CLASSNAME = 'ProfilePasswordComponent';
  public IV: InputValidationService = new InputValidationService();

  @Input() set details(data: IUserDetails) {
    this.isEditMode = false;
    this._userDetails = data;
    this._buildForm();
  };

  @Output() save = new EventEmitter<any>();

  public get userDetails() {
    return this._userDetails;
  }

  public isVisible = true;
  public isEditMode = false;
  public saving = false;
  public PasswordChange: IPassword[] = [];
  public passwordForm: FormGroup;
  public authenticatecurrentpassword = false;

  private _userDetails: IUserDetails = null;

  constructor(private _fb: FormBuilder,
              private _accountSvc: AccountService,
              private _broadcaster: BroadcastService,
              private _toastr: ToastrService,
              private _log: LoggingService) {
    _broadcaster.on(APP_KEYS.onProfileEdit).subscribe(
      (key: string) => {
        if(key === APP_KEYS.profileSaveError){
          this.saving = false;
          return;
        }

        this.isVisible = true;

        if (key === 'ProfileSecurityQuestionComponent') {
          this.isVisible = false;
          this._cancelEdit();
        }
        else if (this.isEditMode && key !== this.CLASSNAME && (this._accountSvc && this._accountSvc.changePasswordErrors === true)) {
          this._cancelEdit();
        }
      });
  }

  ngOnInit() {
    this._accountSvc.changePasswordErrors = false;
    this._buildForm();
  }

  public onEditClick() {
    this._broadcaster.broadcast(APP_KEYS.onProfileEdit, this.CLASSNAME);
    this.isEditMode = true;
  }
public validateCurrentpassword($event: any){
//JLY
let validatecurrentpwd = false;
let validatecurrentuserpwd = {
  password:  this.passwordForm.controls['password'].value,
  username: this._userDetails.username
} 
this._accountSvc.ValidateChangePwd(validatecurrentuserpwd).subscribe(
  response => {
    if (response.IsAuthenticated) {
      validatecurrentpwd = true;
      this.ChangePassword($event,true)
    }  
    if (!response.IsAuthenticated)
    {
      this._toastr.error(CONSTANTS.profileChangePasswordMsgs.invalidCurrentPassword);
    }
  },
  err => {   
    validatecurrentpwd = false
  },
  );

  
//JLY
}
public ChangePassword($event: any,validatepassword){
  let userErrorMessage = '';
  let currentPwd = this.passwordForm.controls['password'].value;
  let newPwd = this.passwordForm.controls['newPassword'].value;
  let confirmPwd = this.passwordForm.controls['confirm'].value;

    if(validatepassword){
    let user = {
      password:  newPwd,
      username: this._userDetails.username,
      userid: this._userDetails.userId
    } 
    
    this._accountSvc.UpdateCurrentPwd(user).subscribe(
      response => {
       if(response){
        if (response.PasswordUpdated) {
          //  let model = this.passwordForm.getRawValue();
            this.saving = false;
            this.isEditMode = false;
           // this.save.emit(model);
           this._broadcaster.broadcast(APP_KEYS.onProfileEdit, '');
            $event.preventDefault();
           // $event.preventDefault();  
            this._toastr.success(CONSTANTS.profileChangePasswordMsgs.savePasswordSucess);
            this.passwordForm.controls['newPassword'].setValue('');
            this.passwordForm.controls['confirm'].setValue('');
        }         
        if (!response.PasswordUpdated) {            
          this.isEditMode = true;
          this._toastr.error('Invalid Data ' + response.Message.toString());
          return;
        }       
      }
      },
      err => {          
        this.isEditMode = true;
        this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
      },
      );
  }
}
  public onSaveClick($event: any) {
  let userErrorMessage = '';
  let currentPwd = this.passwordForm.controls['password'].value;
  let newPwd = this.passwordForm.controls['newPassword'].value;
  let confirmPwd = this.passwordForm.controls['confirm'].value;

 
  if(currentPwd == '' || newPwd == ''||  confirmPwd == '')
  {      
    this.isEditMode = true;
    this._toastr.error(CONSTANTS.profileChangePasswordMsgs.invalidPassword);
  }
  else if(newPwd !== confirmPwd) {
    
    this.isEditMode = true;
      this._toastr.error(CONSTANTS.profileChangePasswordMsgs.invalidPasswordMatch);
  }
  else{
    this.validateCurrentpassword($event); 
  }

  }

  public onCancelClick($event: any) {
    this.passwordForm.controls['password'].setValue('');
    this.passwordForm.controls['newPassword'].setValue('');
    this.passwordForm.controls['confirm'].setValue('');

    this.isEditMode = false;
    this._broadcaster.broadcast(APP_KEYS.onProfileEdit, '');
    $event.preventDefault();
  }

  private _buildForm() {
    if (this.userDetails) {
    this.passwordForm = this._fb.group({
      password: '',
      newPassword: '',
      confirm: ''
    });
  }
  }

  private _cancelEdit() {
    this.saving = false;
    this.isEditMode = false;
    this._buildForm();
  }
}
