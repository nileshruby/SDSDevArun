import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule, LocationStrategy } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavigationService, HttpBaseService, VaultService, SessionService, LoggingService, AccountService, ProductService, InputValidationService } from '@app/services';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ResetSecurityQuestionComponent } from '@app/modules/shared/components';
import { Router, ActivatedRoute }       from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UrlResolver } from '@app/services/url-reolver';
import { IsSecurityTokenValidResponse } from '@app/models/issecuritytokenvalid';
import { ISecurityQuestionResponse } from '@app/models/securityQuestions';
import { SingletonService } from '@app/services/singleton.svc';
import { IApiResponseBackend } from '@app/entities/api-response';

describe('ResetSecurityQuestionComponent', () => {
    let component: ResetSecurityQuestionComponent;
    let fixture: ComponentFixture<ResetSecurityQuestionComponent>;
    let injector;
    let _sessionSvc: SessionService;
    let _navSvc: NavigationService;
    let _vault: VaultService;
    let _toastr: ToastrService;
    let _route;
    let _router: Router;
    let _accountService: AccountService;
    let _log: LoggingService;
    beforeEach(async(() => {
        const fakeActivatedRoute = {
            url: '/Security/ResetQuestion/',
            navigate: jasmine.createSpy('navigate')
          };
        TestBed.configureTestingModule({
            declarations: [
                ResetSecurityQuestionComponent,
            ],
            imports: [
                CommonModule,
                ReactiveFormsModule,
                HttpClientTestingModule ,
                ToastrModule.forRoot(),
            ],
            providers: [
                SessionService,
                CommonModule,
                HttpBaseService,
                LoggingService,
                VaultService,
                LocationStrategy,
                ToastrService,
                { provide: ActivatedRoute, useValue: _route },
                AccountService,
                NavigationService,
                ProductService,
                InputValidationService,
                {provide: Router, useValue: fakeActivatedRoute},
                UrlResolver,
                SingletonService

            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();

        fixture         = TestBed.createComponent(ResetSecurityQuestionComponent);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        _sessionSvc     = injector.get(SessionService);
        _navSvc         = injector.get(NavigationService);
        _toastr         = injector.get(ToastrService);  
        _vault          = injector.get(VaultService);
        _route          = injector.get(ActivatedRoute);
        _log            = TestBed.get(LoggingService);
        _router         = TestBed.get(Router);
        _accountService     = injector.get(AccountService);
        fixture.detectChanges();
    }));

    it('should be created', async(() => {
        expect(component).toBeTruthy();
    }));

    describe('ngOnInit', () => {
        it('should call ngOnInit function', () => {
          let response:IApiResponseBackend = {
              Data:{
                IsRecordExist : true,
                UsrId: 1,
                IsSecurityQuestionConfigured: true,
                UserName: 'test',
                SeqId: 1,
                SecurityAnswer: 'ans 1',
                SecurityQuestion: 'question 1',
                IsFirstTimeLogin: true,
                IsTokenExpired: false,
                IsResetSecurityQuestion: false
              },
              ErrorMessages:[],
              Expiration: new Date(),
              Flags: []
            };
          const spyOnIsToken = spyOn(_accountService, 'isTokenValid').and.returnValue(of(response));
          let question1:ISecurityQuestionResponse = {
              Question: 'Test Question 1',
              QuestionId: 1
          };
          let data = [question1];
          const spyOnIsQuestion = spyOn(_accountService, 'getSecurityQuestions2').and.returnValue(of(data));
          component.ngOnInit();
          expect(spyOnIsToken).toHaveBeenCalled();
          expect(spyOnIsQuestion).toHaveBeenCalled();
          expect(component.userName).toEqual('test');
          expect(component.questions.length).toEqual(data.length);
        });
    });

    describe('onFormCancel', () => {
      it('should call onFormCancel function. when click on the cancel button.', () => {
        component.onFormCancel('');
        expect(_router.navigate).toHaveBeenCalledWith(['/login']);
      });
  });


});

