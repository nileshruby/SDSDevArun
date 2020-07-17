import { ISecurityQuestionResponses } from './../../../../models/securityQuestions';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from '@entities/validators';
import { AccountService } from '../../../../services/account.svc';
import { ToastrService } from 'ngx-toastr';
import { CONSTANTS } from '@app/entities/constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-security-question',
  templateUrl: './reset-security-question.component.html',
  styleUrls: ['./reset-security-question.component.css']
})
export class ResetSecurityQuestionComponent implements OnInit {
  public resetSecurityQuestionForm: FormGroup;
  public questions: ISecurityQuestionResponses;
  userId = '';
  userName = '';
  securityQuestion = '';
  newUser = false;

 set _newUser(value: boolean) {
  // if(value===true) {
    const lst = this._accountService.getSecurityQuestions2().subscribe(response => {
      this.questions = response;
    }
    );
  // }
 }

 get _newUser(): boolean {
   return this.newUser;
 }

  token = '';
  public changingState: boolean;
  public notification: string;
  public emailSent = false;
  public contactAdmin = false;

  constructor(private _fb: FormBuilder,
    private _router: Router,
    private _accountService: AccountService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit() {
    const v = this._router.url;
    if (v.indexOf('/Security/ResetQuestion/') !== -1) {
      const idx = v.lastIndexOf('/');
      this.token = v.substring(idx + 1);
      const model = { 'Token': this.token };
      this._accountService.isTokenValid(model).subscribe(response => {
        if (response && response.Data.IsRecordExist) {
          this.userName = response.Data.UserName;
          this.securityQuestion = response.Data.SecurityQuestion;
          this.userId = response.Data.UsrId.toString();
          // this.newUser = response.Data.IsFirstTimeLogin;
          this._newUser = response.Data.IsFirstTimeLogin;
        } else {          
          //Issue message invalid request : bad token
          this._toastr.error('Link is either expired or Invalid!');
          this._router.navigate(['/login']);
        }
      });
    // }

    this._resetPage();
  
}

  }

  _resetPage() {
    this.resetSecurityQuestionForm = this._fb.group({
      username: new FormControl('', [
        Validators.required,
        CustomValidators.AlphaNumericWithSelectedSpecialCharacters
      ]),
      securityQuestion: new FormControl('', Validators.required),
      securityanswer: new FormControl('', Validators.required),
      comfirmpassword: new FormControl('', Validators.required)
    });
  }

  onResetSecurityQuestion(env) {
    const securityQuestionId: string = this.resetSecurityQuestionForm.get('securityQuestion').value;
    const securityAnswer: string = this.resetSecurityQuestionForm.get('securityanswer').value;
    const confirmPassword: string = this.resetSecurityQuestionForm.get('comfirmpassword').value;

    if (!securityQuestionId || !securityAnswer || !confirmPassword) {
      this._toastr.error(CONSTANTS.sharedComponentMsgs.resetPassword.invalidData);
      return;
    }

    //Validate User 
    const userValidaterequest = { Username: this.userName, Password: confirmPassword, SecurityAnswer: securityAnswer };
    this._accountService.authenticateUser(userValidaterequest).subscribe(res => {
      if (res.Data.IsAuthenticated == false) {
        if(res.Data.IsLocked){
          //inactivate security link  
          this._toastr.error('Link is either expired or Invalid!');
          this._router.navigate(['/login']);        
        }
        this._toastr.error(CONSTANTS.sharedComponentMsgs.resetPassword.invalidPassword);
        return;
      }
      else
      {
        (Swal as any).fire({
          title: CONSTANTS.sharedComponentMsgs.resetPassword.userresetSecurityEmailConfirm,
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result) => {
          if (result.value) {
            //if Password valid request Security question/ Answer Update.
            const requestModel = { UsrId: this.userId, SeqId: securityQuestionId, SecurityAnswer: securityAnswer, UserName:this.userName };
    
            this._accountService.updateUserSecurityQuestion(requestModel).subscribe(response => {
              if (response) { 
                this._toastr.success(CONSTANTS.sharedComponentMsgs.resetPassword.updateSecurityQuesAnswer); 
              //inactivate security link handled from backend
               this._router.navigate(['/login']); 
              }
              else { this._toastr.error(CONSTANTS.sharedComponentMsgs.resetPassword.failupdateSecurityQuesAnswer); }
            });
          }
        });
      }
    });

   
  }

  onFormCancel(env) {
    (Swal as any).fire({
      title: CONSTANTS.sharedComponentMsgs.resetPassword.confirmCancel,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
      this._router.navigate(['/login']);
      }
    });
  }
}
