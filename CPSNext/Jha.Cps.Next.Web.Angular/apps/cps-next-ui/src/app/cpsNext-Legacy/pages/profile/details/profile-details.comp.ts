import { VaultService } from './../../../services/vault.svc';
import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {CONSTANTS} from '@entities/constants';
import {BroadcastService, LoggingService, InputValidationService, AccountService} from '@app/services';
import {IUserDetails, UserDetailContext} from '@entities/models';
import {APP_KEYS} from '@entities/app-keys';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'profile-details',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './profile-details.html',
  styleUrls: ['./profile-details.scss']
})

export class ProfileDetailsComponent implements OnInit {
  protected readonly CLASSNAME = 'ProfileDetailsComponent';
  invalidPhoneAltLength =  false;
  invalidPhoneLength = false;
  public IV: InputValidationService = new InputValidationService();

  @Input() set details(data: IUserDetails) {
    this.isEditMode = false;
    this._userDetails = data;

    if(data) {
      if(data.phone) this. invalidPhoneLength = (data.phone.length > 0 && data.phone.length < 10);
      if(data.phoneAlt) this. invalidPhoneAltLength = (data.phoneAlt.length > 0 && data.phoneAlt.length < 10);
    }
    this._buildForm();
  }
  public get userDetails() {
    return this._userDetails;
  }
  public isEditMode = false;
  public saving = false;
  public detailsForm: FormGroup;
  public _userDetails: IUserDetails = null;

  constructor(private _fb: FormBuilder,
              private _broadcaster: BroadcastService,
              private _toastr: ToastrService,
              private _log: LoggingService,
              private _accountSvc: AccountService) {
  }

  ngOnInit() {
    this._buildForm();
  }

  public onEditClick() {
    this.isEditMode = true;
  }


  validatePhoneNumberEntry( env) {
    const phoneLen = this.detailsForm.get('phone').value.replace(/\D/g,'').length;
    const phoneAltLen = this.detailsForm.get('phoneAlt').value.replace(/\D/g,'').length;
    
    this.invalidPhoneLength = (phoneLen > 0 && phoneLen < 10);
    this.invalidPhoneAltLength = ( phoneAltLen > 0 && phoneAltLen < 10);
  }

  public onSaveClick() {

    let validPhone = true;
    let validextension = true;

    let model = this.detailsForm.getRawValue();

    if(model) {
      
      if(model.phoneAlt && (model.phoneAlt.length < 14 && model.phoneAlt.length > 0)) {
        this.invalidPhoneAltLength = (model.phoneAlt.length > 0 && model.phoneAlt.length < 14);
        validPhone = (model.phoneAlt.toString().replace(/\D/g,'').length === 0);
      }
      if(model.phone && model.phone.length < 14 && model.phone.length > 0 && validPhone) {
        this.invalidPhoneLength = (model.phone.length > 0 &&  model.phone.length < 14);
        validPhone = (model.phone.toString().replace(/\D/g,'').length === 0);
      }
      if(model.extension && model.extension.length < 3 && model.phone.length > 0 && validextension) {
        validextension = false;
      }
    }

    if(!validPhone || !validextension) {
      this._toastr.error(CONSTANTS.genericCRUDMsgs.invalidInputs);
      return;
    }
    const requestModel: any = { UsrID: this.userDetails.userId, Phone: model.phone, 
      Extension: model.extension, Phone2: model.phoneAlt, phoneAlt: model.phoneAlt};

      this.saving = true;
    this._accountSvc.updateUserProfileDetails(requestModel).subscribe(
      response => {
         this._toastr.success(CONSTANTS.genericCRUDMsgs.saveSuccess); 
         this.saving = false;
         this.isEditMode = false;
         this.userDetails.phone = model.phone;
         this.userDetails.phoneAlt = model.phoneAlt;
         this.userDetails.extension = model.extension;
         this._buildForm();
        }
    );
    //}
  }

  public onCancelClick() {
    this.invalidPhoneAltLength = false;
    this.invalidPhoneLength = false;
    this.isEditMode = false;
    this._buildForm();
  }

  private _buildForm() {
    if (this.userDetails) {
      this.detailsForm = this._fb.group({
        userId: new FormControl(this.userDetails.userId, Validators.required),
        phone: new FormControl(this.userDetails.phone.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'), Validators.required),
        extension: new FormControl(this.userDetails.extension, Validators.required),
        phoneAlt: new FormControl(this.userDetails.phoneAlt ? this.userDetails.phoneAlt.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '', Validators.required)
      });
    }
    else {
      this.detailsForm = this._fb.group({
        userId: new FormControl('', Validators.required),
        phone: new FormControl('', Validators.required),
        extension: new FormControl('', Validators.required),
        phoneAlt: new FormControl('', Validators.required)
      });
    }
  }

  private _cancelEdit() {
    this.saving = false;
    this.isEditMode = false;
    this._buildForm();
  }
}
