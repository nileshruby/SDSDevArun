import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule, LocationStrategy } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavigationService, HttpBaseService, VaultService, SessionService, LoggingService, AccountService, ProductService, InputValidationService } from '@app/services';
import { ToastrModule } from 'ngx-toastr';
import { LoginPage } from '.';
import { Router, ActivatedRoute, Params }       from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UrlResolver } from '@app/services/url-reolver';
import { SingletonService } from '@app/services/singleton.svc';

describe('LoginPage', () => {
    let component: LoginPage;
    let fixture: ComponentFixture<LoginPage>;
    let injector;
    let _sessionSvc: SessionService;
    let _navSvc: NavigationService;
    let _vault: VaultService;
    let _route;// = ({ queryParams: of({ returnUrl: 'http://test.com', st: true }) } as any) as ActivatedRoute;
    let _router: Router;
    const routerSpy = createRouterSpy();
    let _accountSvc: AccountService;
    let _log: LoggingService;
    beforeEach(async(() => {
        const fakeActivatedRoute = {
            snapshot: { data: { } },
            queryParams: of<Params>({ returnUrl: 'http://test.com', st: true })
          } as ActivatedRoute;
        TestBed.configureTestingModule({
            declarations: [
                LoginPage,
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
                { provide: ActivatedRoute, useValue: _route },
                { provide: Router,         useValue: routerSpy},
                AccountService,
                NavigationService,
                ProductService,
                InputValidationService,
                {provide: ActivatedRoute, useValue: fakeActivatedRoute},
                UrlResolver,
                SingletonService

            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();

        fixture         = TestBed.createComponent(LoginPage);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        _sessionSvc     = injector.get(SessionService);
        _navSvc         = injector.get(NavigationService);
        _vault          = injector.get(VaultService);
        _route          = injector.get(ActivatedRoute);
        _log            = TestBed.get(LoggingService);
        _router         = TestBed.get(Router);
        _accountSvc     = injector.get(AccountService);
        fixture.detectChanges();
    }));

    it('should be created', async(() => {
        expect(component).toBeTruthy();
    }));

    describe('onLoginFormSubmit', () => {
        it('should return Invalid data error. if loginForm invalid', () => {
            component.loginForm.setValue({username : '', password: ''});
            component.onLoginFormSubmit('');
            expect(component.loginForm.invalid).toBe(true);
        });
        it('should have the  onLoginFormSubmit being called when the form is submitted. and  if redirectTo is dashboard so return on step 1', () => {
            component.loginForm.setValue({username : 'test', password: '123123'});
            let data:any = {
                    "isAuthenticated":true,
                    "userId":71,
                    "username":"THuynh",
                    "isSysAdmin":true,
                    "expiration":"2019-08-26T08:26:59.4754982-05:00",
                    "assginedProducts":[ {
                            "productId":1,
                            "displayOrder":1,
                            "productName":"Introduction",
                            "shortDesc":null,
                            "longDesc":null,
                            "role":"Admin",
                            "prefix":null,
                            "isOffered":true,
                            "createdBy":null,
                            "createDate":null,
                            "updatedBy":null,
                            "updateDate":null,
                            "productNotes":[],
                            "productStats":[],
                            "contacts":[],
                            "contactId":0,
                            "contactName":null,
                            "contactEmail":null,
                            "contactPhone":null,
                            "contactType":null,
                            "versionNumber":null,
                            "supportNumber":null,
                            "routeName":"introduction",
                            "productContainerId":null,
                            "productCssPrefix":null,
                            "mainCssClass":null,
                            "productHighlightedCssClass":null,
                            "bigImageCssClass":null,
                            "disableCssClass":null,
                            "productSelectedCssClass":null
                    }]
            };
            let date = new Date();
            const spyOnSaveUser = spyOn(_accountSvc, 'login').and.returnValue(of( { data: data, "redirectTo":"Dashboard", "expiration": date, "errorMessages": [], "flags": [] }));
            component.onLoginFormSubmit('');
            expect(component.loginForm.valid).toBe(true);
            expect(spyOnSaveUser).toHaveBeenCalled();
        });
        it('should have the  onLoginFormSubmit being called when the form is submitted. and  if redirectTo is secondaryauthentication so return on step 2', () => {
            component.loginForm.setValue({username : 'test', password: '123123'});
            let data:any = {
                    "isAuthenticated":true,
                    "userId":71,
                    "username":"THuynh",
                    "isSysAdmin":true,
                    "expiration":"2019-08-26T08:26:59.4754982-05:00",
                    "assginedProducts":[ {
                            "productId":1,
                            "displayOrder":1,
                            "productName":"Introduction",
                            "shortDesc":null,
                            "longDesc":null,
                            "role":"Admin",
                            "prefix":null,
                            "isOffered":true,
                            "createdBy":null,
                            "createDate":null,
                            "updatedBy":null,
                            "updateDate":null,
                            "productNotes":[],
                            "productStats":[],
                            "contacts":[],
                            "contactId":0,
                            "contactName":null,
                            "contactEmail":null,
                            "contactPhone":null,
                            "contactType":null,
                            "versionNumber":null,
                            "supportNumber":null,
                            "routeName":"introduction",
                            "productContainerId":null,
                            "productCssPrefix":null,
                            "mainCssClass":null,
                            "productHighlightedCssClass":null,
                            "bigImageCssClass":null,
                            "disableCssClass":null,
                            "productSelectedCssClass":null
                    }]
            };
            let date = new Date();
            const spyOnSaveUser = spyOn(_accountSvc, 'login').and.returnValue(of({data: data, redirectTo:"secondaryauthentication", value: "12345", "expiration": date, "errorMessages": [], "flags": [] }));
            component.onLoginFormSubmit('');
            expect(component.loginForm.valid).toBe(true);
            expect(spyOnSaveUser).toHaveBeenCalled();
        });
    });
    describe('onResendOtpClick', () => {
        it('should call onResendOtpClick function if click resend button.', () => {
            component.otpForm.setValue({username : 'test', otp: '1234', requestKey: '11111'});
            let date = new Date();
            const spyOnSaveUser = spyOn(_accountSvc, 'resendOtp').and.returnValue(of({ "expiration": date, "errorMessages": [], "flags": []}));
            component.onResendOtpClick();
            expect(component.otpResent).toEqual(true);
            expect(spyOnSaveUser).toHaveBeenCalled();
        });
    });
    describe('onUsernameChange', () => {
        it('should call onUsernameChange function if change username.', () => {
            component.errorMessages = ['error']
            component.onUsernameChange('');
            expect(component.errorMessages.length).toEqual(0);
        });
    });
    describe('onPasswordChange', () => {
        it('should call onPasswordChange function if change password.', () => {
            component.errorMessages = ['error']
            component.onPasswordChange('');
            expect(component.errorMessages.length).toEqual(0);
        });
    });

    describe('onOtpFormSubmit', () => {
        it('should return Invalid data error. if loginForm invalid', () => {
            component.otpForm.setValue({username : '', otp: '', requestKey: ''});
            component.onOtpFormSubmit('');
            expect(component.loginForm.invalid).toBe(true);
        });
        it('should have the  onOtpFormSubmit being called when the form is submitted.', () => {
            component.otpForm.setValue({username : 'test', otp: '1234', requestKey: '1111'});
            let data:any = {
                    "isAuthenticated":true,
                    "userId":71,
                    "username":"THuynh",
                    "isSysAdmin":true,
                    "expiration":"2019-08-26T08:26:59.4754982-05:00",
                    "assginedProducts":[ {
                            "productId":1,
                            "displayOrder":1,
                            "productName":"Introduction",
                            "shortDesc":null,
                            "longDesc":null,
                            "role":"Admin",
                            "prefix":null,
                            "isOffered":true,
                            "createdBy":null,
                            "createDate":null,
                            "updatedBy":null,
                            "updateDate":null,
                            "productNotes":[],
                            "productStats":[],
                            "contacts":[],
                            "contactId":0,
                            "contactName":null,
                            "contactEmail":null,
                            "contactPhone":null,
                            "contactType":null,
                            "versionNumber":null,
                            "supportNumber":null,
                            "routeName":"introduction",
                            "productContainerId":null,
                            "productCssPrefix":null,
                            "mainCssClass":null,
                            "productHighlightedCssClass":null,
                            "bigImageCssClass":null,
                            "disableCssClass":null,
                            "productSelectedCssClass":null
                    }]
            };
            let date = new Date();
            const spyOnSaveUser = spyOn(_accountSvc, 'loginOtp').and.returnValue(of({data: data, "redirectTo":"Dashboard", "expiration": date, "errorMessages": [], "flags": [] }));
            component.onOtpFormSubmit('');
            expect(component.otpForm.valid).toBe(true);
            expect(spyOnSaveUser).toHaveBeenCalled();
        });
    });

});
function createRouterSpy() {
    return jasmine.createSpyObj('Router', ['navigate']);
  }
