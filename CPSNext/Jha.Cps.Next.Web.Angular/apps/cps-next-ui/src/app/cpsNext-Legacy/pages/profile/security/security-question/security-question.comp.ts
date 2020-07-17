import { ISecurityQuestionResponse } from '@app/models/securityQuestions';
import { CONSTANTS } from './../../../../entities/constants';
import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {AccountService, BroadcastService, LoggingService} from '@app/services';
import {ISecurityQuestion} from '@entities/models';
import {IUserDetails} from '@entities/models';
import {APP_KEYS} from '@entities/app-keys';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'security-question',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './security-question.html',
  styleUrls: ['./security-question.scss']
})

export class ProfileSecurityQuestionComponent implements OnInit {
  protected readonly CLASSNAME = 'ProfileSecurityQuestionComponent';

  @Input() set details(data: IUserDetails) {
    this._log.debug(`${this.CLASSNAME} > value() > details(): `, data);

    this.isEditMode = false;
    this._userDetails = data;
    this._setSecurityQuestion();
    this._buildForm();
  };

  @Output() save = new EventEmitter<any>();

  public get userDetails() {
    return this._userDetails;
  }
  

  public isVisible = true;
  public isEditMode = false;
  public saving = false;
  // public securityQuestions: ISecurityQuestion[] = [];
  public securityQuestions: ISecurityQuestionResponse[] = [];
  public selectedQuestion = '';
  public securityForm: FormGroup;

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

        if (key === 'ProfilePasswordComponent') {
          this.isVisible = false;
          this._cancelEdit();
        }
        else if (this.isEditMode && key !== this.CLASSNAME) {
          this._cancelEdit();
        }
      });
    this._getSecurityQuestions();
  }

  ngOnInit() {
    this._buildForm();
  }

  public onSelectionChange($event) {
    this._log.debug(`${this.CLASSNAME} > onSelectionChange > $event: `, $event);
  }

  public onEditClick() {
    this._broadcaster.broadcast(APP_KEYS.onProfileEdit, this.CLASSNAME);
    this.isEditMode = true;
  }

  public onSaveClick($event: any) {
    if(this.securityForm.controls['questionId'].value >= 1){

     }else{
      this._toastr.error(CONSTANTS.profileSecurityQuestionMsgs.invalidSecurityQuestion);
    }
    if(this.securityForm.controls['answer'].value == '')
    {
      this._toastr.error(CONSTANTS.profileSecurityQuestionMsgs.invalidSecurityAnswer);
    }else{
      let model = this.securityForm.getRawValue();
      this.saving = true;
      this.save.emit(model);
      $event.preventDefault();
    }
  }

  public onCancelClick($event: any) {
    this._broadcaster.broadcast(APP_KEYS.onProfileEdit, '');
    $event.preventDefault();
  }


  private _buildForm() {
    if (this.userDetails) {
      this.securityForm = this._fb.group({
        questionId: this.userDetails.questionId,
        answer: ''
      });
    }
    else {
      this.securityForm = this._fb.group({
        questionId: 0,
        answer: ''
      });
    }
  }

  private _setSecurityQuestion() {
    if (this.userDetails && this.userDetails.questionId &&
      this.securityQuestions && this.securityQuestions.length) {
      this.selectedQuestion = this.securityQuestions.find((q: ISecurityQuestionResponse) => {
        return q.QuestionId === this.userDetails.questionId;
      }).Question.toString() || '';
    }
  }

  private _getSecurityQuestions() {

    //Commentented code is below pending plans to redirect call to service API
    // const lst = this._accountSvc.getSecurityQuestions2().subscribe(response => {
    //   this.securityQuestions = response;
    // }

    this._accountSvc.getSecurityQuestions2().subscribe(
      res => {
        if(res && res.length) {
          // console.log('Security Questions: ' + res);
          this.securityQuestions = res;
          this._setSecurityQuestion();
        }
      }
    );
    // this._accountSvc.getSecurityQuestions().subscribe(
    //   response => {
    //     if (response.data && response.data.length) {
    //       this.securityQuestions = response.data;
    //       this._setSecurityQuestion();
    //     }
    //   });
  }

  private _cancelEdit() {
    this.saving = false;
    this.isEditMode = false;
    this._buildForm();
  }
}
