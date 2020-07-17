import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { ProfileDetailsComponent } from '././profile-details.comp';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { DialogService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, AccountService} from '@app/services';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as _ from 'lodash';
import { UrlResolver } from '@app/services/url-reolver';
import {BroadcastService, InputValidationService} from '@app/services';
import {IUserDetails} from '@entities/models';
import { PhoneFormatPipe } from '@app/modules/shared/pipes';
import { of } from 'rxjs';
import { SingletonService } from '@app/services/singleton.svc';

describe('ProfileDetailsComponent', () => {
  let component: ProfileDetailsComponent;
  let fixture: ComponentFixture<ProfileDetailsComponent>;
  let injector;
  let _accountSvc: AccountService;
  let userDetails: IUserDetails;
  let toastrService: ToastrService;
  let dialogService: DialogService;
  let inputValidationService: InputValidationService;
  let debugElement: DebugElement;
  let element: HTMLElement;
  let _sessionSvc: SessionService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileDetailsComponent, PhoneFormatPipe],
        imports: [
            CommonModule,
            ReactiveFormsModule,
            HttpClientTestingModule,
            HttpClientModule,            
            ToastrModule.forRoot(),
            FormsModule
        ],
        providers: [
            DialogService,
            InputValidationService,
            BroadcastService,
            HelpersService,
            SessionService,
            HttpBaseService,
            LoggingService,
            VaultService,
            ToastrService,
            AccountService,
            UrlResolver,
            SingletonService
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ],  
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture         = TestBed.createComponent(ProfileDetailsComponent);
    component       = fixture.componentInstance;
    injector        = getTestBed();
    _accountSvc     = injector.get(AccountService);
    toastrService   = injector.get(ToastrService);
    dialogService   = injector.get(DialogService);
    _sessionSvc     = injector.get(SessionService);
    debugElement    = fixture.debugElement;
    element         = debugElement.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    let _userDetail: IUserDetails    = {
      userId: 1,
      username: 'test',
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      phone: '123-123-1234',
      extension:'1234',
      phoneAlt: '123-123-1234',
      questionId: 1,
      question: 'test',
      answer: 'test'
    };
    component.details = _userDetail;
    expect(component).toBeTruthy();
  });
  
  describe('onCancelClick', () => {
    it('should call onCancelClick function on click cancel button. Then the modal should close', () => {
        component.onCancelClick();
        expect(component.isEditMode).toBe(false);
    });
  });
  describe('onSaveClick', () => {
    it('should return Invalid data error. if detailsForm id invalid', () => {
        component.detailsForm.setValue({userId : '', phone: '', extension: '', phoneAlt: ''});
        component.onSaveClick();
        expect(component.detailsForm.invalid).toBe(true);
    });
    it('should have the detailsForm being called when the form is submited', () => {
      let _userDetail: IUserDetails    = {
        userId: 1,
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        email: 'test@test.com',
        phone: '123-123-1234',
        extension:'1234',
        phoneAlt: '123-123-1234',
        questionId: 1,
        question: 'test',
        answer: 'test'
      };
      component.details = _userDetail;
        component.detailsForm.setValue({userId : '12', phone: '(222) 222-2222', extension: '1234', phoneAlt: '(878) 785-4545'});
        let data:any = {
            "userId":12,
            "phone":"(222) 222-2222",
            "phoneAlt":"(878) 785-4545",
            "extension":'1232',          
            };   
            const spyOnSaveUser = spyOn(_accountSvc, 'updateUserProfileDetails').and.returnValue(of( data ));
            component.onSaveClick();
            expect(component.detailsForm.valid).toBe(true);
            expect(spyOnSaveUser).toHaveBeenCalled();    
    });
  });
  describe('onEditClick', () => {
      it('should have the edit product when the form is onEditClick', () => {
          component.onEditClick();
          expect(component.isEditMode).toBe(true);
      });
  });
});