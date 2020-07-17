import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { DialogService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, ProductService, AccountService, FiService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { LocalModalComponent } from '@app/modules/shared/components';
import { ProductContext, UserDetailContext } from '@app/entities/models';
import { AdminuserMaintComponent } from './adminuser-maint.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import * as _ from 'lodash';
import { UserContext } from '@app/entities/user-context';
import { UrlResolver } from '@app/services/url-reolver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SingletonService } from '@app/services/singleton.svc';
import { TableModule } from 'primeng/table';
import { IApiResponseBackend } from '@app/entities/api-response';

describe('AdminuserMaintComponent', () => {
    let component: AdminuserMaintComponent;
    let fixture: ComponentFixture<AdminuserMaintComponent>;
    let injector;
    let _prodSvc: ProductService;
    let _accountSvc: AccountService;
    let _sessionSvc: SessionService;
    let toastrService: ToastrService;
    let dialogService: DialogService;
    let adminUserModal: LocalModalComponent;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let mainframeId: DebugElement;
    let inputEl: DebugElement;
    let datatable: ElementRef;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AdminuserMaintComponent,
                LocalModalComponent,
            ],
            imports: [
                CommonModule,
                ReactiveFormsModule,
                HttpClientModule,
                ToastrModule.forRoot(),
                NgMultiSelectDropDownModule.forRoot(),
                SweetAlert2Module.forRoot(),
                FormsModule,
                MatSlideToggleModule,
                HttpClientTestingModule,
                MatSelectModule,
                TableModule
            ],
            providers: [
                DialogService,
                ProductService,
                HelpersService,
                SessionService,
                HttpBaseService,
                LoggingService,
                VaultService,
                ToastrService,
                AccountService,
                FiService,
                UrlResolver,
                SingletonService
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();

        fixture         = TestBed.createComponent(AdminuserMaintComponent);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        _prodSvc        = injector.get(ProductService);
        _accountSvc     = injector.get(AccountService);
        _sessionSvc     = injector.get(SessionService);
        toastrService   = injector.get(ToastrService);
        dialogService   = injector.get(DialogService);
        adminUserModal        = fixture.componentInstance.adminUserModal;
        fixture.detectChanges();
    }));

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call ngOnInit function', () => {
            component.usersData = [];
            let productData:any = [{
                CreateBy: "pparekh",
                CreateDateTime: "2018-04-06T00:00:00",
                IsOffered: true,
                LongDesc: "Multi Factor Authentication",
                Name: "Multi Factor Authentication",
                PrdID: 3,
                ProductCode: "MFAOTP",
                ShortDesc: "Multi Factor Authentication",
                UpdateBy: "THuynh",
                UpdateDateTime: "2019-09-26T08:39:31.97",
                VersionNumber: "test"
            }, {
                CreateBy: "pparekh",
                CreateDateTime: "2018-04-06T00:00:00",
                IsOffered: true,
                LongDesc: "Multi Factor Authentication",
                Name: "Multi Factor Authentication",
                PrdID: 3,
                ProductCode: "MFAOTP",
                ShortDesc: "Multi Factor Authentication",
                UpdateBy: "THuynh",
                UpdateDateTime: "2019-09-26T08:39:31.97",
                VersionNumber: "test"
            }];
            let usersData = [
                { UsrID: 218, FIID: '0', FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", PrdID: 1 },
                { UsrID: 234, FIID: '0', FirstName: "test", LastName: "test2", Email: "test@abc.co", PrdID: 2 },
                { UsrID: 234, FIID: '0', FirstName: "hello", LastName: "12qwe34d", Email: "test@abc.co", PrdID: 3 }
              
            ];
            spyOn(_prodSvc, 'RetrieveProduct').and.returnValue(of(productData));
            spyOn(_accountSvc, 'getUserAccountDetails').and.returnValue(of(usersData));
            component.ngOnInit();
            expect(component.usersData.length).toEqual( 2 );
            expect(component.totalproductcount).toEqual( 1 );
        });
    });

    describe('onSearch', () => {
        it('should call on Search function on search any keyword time and return search result.', () => {
            let user = new UserDetailContext();
            user.Username= 'Test';
            user.FirstName = 'test';
            user.LastName = 'test';
            component.usersData = [user];
            component.onSearch('Test', datatable);
            expect(component.usersData[0].FirstName).toEqual( 'test' );
        });
    });

  describe('onSearch', () => {
    it('should call on Search function on search any keyword time and return search result.', () => {
      let user = new UserDetailContext();
      user.Username = 'Test';
      user.FirstName = 'hello';
      user.LastName = 'test';
      component.usersData = [user];
      component.onSearch('12qwe34d', datatable);
      expect(component.usersData[0].FirstName).toEqual('hello');
    });
  });

    
    describe('isUserExists', () => {
        it('should call isUserExists() function and return true if a user is Exist', () => {
            
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
            let data = new UserDetailContext();
                data.Username = 'Test';
                data.UsrID = 1;
                let date = new Date();
            let response:IApiResponseBackend = {Data:data,Expiration: new Date(),  ErrorMessages: [], Flags: []}
            spyOn(_accountSvc, 'isUserExists').and.returnValue(of(response));
            component.isUserExists(false);
            expect(component.duplicateuser).toEqual( true );
        });

        it('should call isUserExists() function and return false if a user is not Exist', () => {
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
            spyOn(_accountSvc, 'isUserExists').and.returnValue(of());
            component.isUserExists(false);
            expect(component.duplicateuser).toEqual( false );
        });
    });

    describe('isUserEmailExists', () => {
        it('should call isUserEmailExists() function and return true if a email is Exist', () => {
            component.invalidEmail = false;
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
           
            let response = {UsrId: 1, Email: 'bb#bb.com', isUserExists: true}
            spyOn(_accountSvc, 'IsEmailExists').and.returnValue(of(response));
            component.isUserEmailExists(false);
            expect(component.duplicateemail).toEqual( true );
        });

        it('should call isUserEmailExists() function and return false if a email is not Exist', () => {
            component.invalidEmail = false;
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
            let response = {UsrId: 1, Email: 'test#bb.com', isUserExists: false}
            spyOn(_accountSvc, 'IsEmailExists').and.returnValue(of(response));
            component.isUserEmailExists(false);
            expect(component.duplicateemail).toEqual( false );
        });
    });

    describe('ResetUserPasswordGlobalAdmin', () => {
        it('Clicking the toggle button then should call the ResetUserPasswordGlobalAdmin function.', () => {
            component.UserEditing.Username = 'Test';
            component.UserEditing.UsrID = 1;
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
           
            spyOn(_sessionSvc, 'get').and.returnValue(of({username: 'Test'}));
            spyOn(_accountSvc, 'resetUserPassword').and.returnValue(of(true));
            component.ResetUserPasswordGlobalAdmin();
            expect(component.userEmail).toEqual('bb@abc.com');
            expect(component.ResetuserId).toEqual(1);
        });

    });
    describe('resetUserSecurityQuestiondGlobalAdmin', () => {
        it('Clicking the toggle button then should call the resetUserSecurityQuestiondGlobalAdmin function.', () => {
            component.UserEditing.Username = 'Test';
            component.UserEditing.UsrID = 1;
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
           
            spyOn(_sessionSvc, 'get').and.returnValue(of({username: 'Test'}));
            spyOn(_accountSvc, 'resetUserPassword').and.returnValue(of(true));
            component.resetUserSecurityQuestiondGlobalAdmin();
            expect(component.userEmail).toEqual('bb@abc.com');
            expect(component.ResetuserId).toEqual(1);
        });

    });
   
    describe('onUsercreateClick', () => {
        it('should call onUsercreateClick function on click cancel button. Then the modal should open', () => {
            let prlist = new ProductContext();
                prlist.productId = 1;
                prlist.productName = 'test';
            component.prodList = [prlist];
            component.onUsercreateClick();
            expect(component.prodList.length).toEqual(0);
            expect(component.adminUserModal.isOpen).toEqual(true);
        });

    });
    describe('onUserCancelClick', () => {
        it('should call onUserCancelClick function on click cancel button. Then the modal should close', () => {
            
            component.onUserCancelClick('', '');
            expect(component.adminUserModal.isOpen).toEqual(false);
        });
    });
    describe('onsecondaryAuthToggle', () => {
        it('Clicking the toggle button then should call the onsecondaryAuthToggle function if click yes then return true.', () => {
            component.UserEditing.Username = 'Test';
            component.UserEditing.UsrID = 1;
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
           
            spyOn(_sessionSvc, 'get').and.returnValue(of({username: 'Test'}));
            let date = new Date();
            let response = {data:[],  "expiration": date, "errorMessages": [], "flags": [] };
            spyOn(_accountSvc, 'changeSecondaryAuthLockStatus').and.returnValue(of(response));
            component.onsecondaryAuthToggle(true);
            expect(component.SecondaryAuthUser).toEqual(true);
        });
        it('Clicking the toggle button then should call the onsecondaryAuthToggle function if click no then return false.', () => {
            component.UserEditing.Username = 'Test';
            component.UserEditing.UsrID = 1;
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
           
            spyOn(_sessionSvc, 'get').and.returnValue(of({username: 'Test'}));
            let date = new Date();
            let response = {data:[],  "expiration": date, "errorMessages": [], "flags": [] };
            spyOn(_accountSvc, 'changeSecondaryAuthLockStatus').and.returnValue(of(response));
            component.onsecondaryAuthToggle(false);
            expect(component.SecondaryAuthUser).toEqual(false);
        });

    });
    describe('onUserLockToggle', () => {
        it('Clicking the toggle button then should call the onUserLockToggle function if click yes then return true.', () => {
            component.UserEditing.Username = 'Test';
            component.UserEditing.UsrID = 1;
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
           
            spyOn(_sessionSvc, 'get').and.returnValue(of({username: 'Test'}));
            let date = new Date();
            let response = {data:[],  "expiration": date, "errorMessages": [], "flags": [] };
            spyOn(_accountSvc, 'changeSecondaryAuthLockStatus').and.returnValue(of(response));
            spyOn(_accountSvc, 'changeUserLockStatus').and.returnValue(of(response));
            component.onUserLockToggle(true);
            expect(component.userlockState).toEqual(true);
        });
        it('Clicking the toggle button then should call the onUserLockToggle function if click no then return false.', () => {
            component.UserEditing.Username = 'Test';
            component.UserEditing.UsrID = 1;
            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
           
            spyOn(_sessionSvc, 'get').and.returnValue(of({username: 'Test'}));
            let date = new Date();
            let response = {data:[],  "expiration": date, "errorMessages": [], "flags": [] };
            spyOn(_accountSvc, 'changeSecondaryAuthLockStatus').and.returnValue(of(response));
            spyOn(_accountSvc, 'changeUserLockStatus').and.returnValue(of(response));
            component.onUserLockToggle(false);
            expect(component.userlockState).toEqual(false);
        });

    });
    // describe('GetTotalProductscount', () => {
    //     it('GetTotalProductscount function should return product number.', () => {
           
    //         spyOn(_accountSvc, 'RetrieveProduct').and.returnValue(of(pr));
    //         component.GetTotalProductscount();
    //         expect(component.totalproductcount).toEqual(1);
    //     });
    // });
    describe('onUserSaveClick', () => {
        it('should return Invalid data error. if adminUserForm invalid', () => {
            
            component.adminUserForm.setValue({FIID: 0, FirstName: "", LastName: "", Email: "", Username: '', FIName: 'test', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.onUserSaveClick();
            expect(component.adminUserForm.invalid).toBe(true);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

        it('should return false and error. if UsrSelectedProds is empty', () => {

            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: '', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
            component.UsrSelectedProds = [];
            spyOn(_sessionSvc, 'get').and.returnValue(of({username: 'Test'}));
            let resp = component.onUserSaveClick();
            expect(resp).toEqual(false);
        });
        it('should have the  onUserSaveClick being called when the form is submited and if UserEditing is empty so save user.', () => {

            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: '', MainframeFIID: '123', Phone: '123456789', Phone2: '123456789', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
            component.duplicateuser = false;
            component.duplicateemail = false;
            
            let usp = new ProductContext();
            usp.productId = 1;
            usp.productName = 'Test';
            component.UsrSelectedProds = [usp];

            let data: any = {};
                data.FirstName = 'AABFN45';
                data.LastName = 'AABLN45123';
                data.Username = 'test';
                data.ProductsAssigned = [2];

            component.UserEditing = new UserDetailContext();

            let udata = new UserContext();
                udata.isAuthenticated = true;
                udata.assginedProducts = [];
                udata.userId = 1;
                udata.username = 'test';
                component._userDetails = udata;
            spyOn(_sessionSvc, 'get').and.returnValue(of(udata));
            let date = new Date();
            let response = {data:data,  "expiration": date, "errorMessages": [], "flags": [] };
            spyOn(_accountSvc, 'createProductUserAccount').and.returnValue(of(response));
            let response1:IApiResponseBackend = {Data:{userId: 1},  Expiration: date, ErrorMessages: [], Flags: [] };
            spyOn(_accountSvc, 'getUserDetailsByUserName').and.returnValue(of(response1));
            component.onUserSaveClick();
            expect(component.adminUserModal.isOpen).toEqual(false);
        });
    });
    describe('FIChange', () => {
        it('should have the  FIChange being called when the Fi is select', () => {
            component.FIChange({ FIID: 1, Name: 'test' });
            expect(component.adminUserForm.controls['FIName'].value).toEqual('test');
        });
    });
    describe('ProductAssginedSelectedAll', () => {
        it('should have the ProductAssginedSelectedAll being called when the product is all select ', () => {
            let prod1 = new ProductContext();
                prod1.productId = 1;
            let prod2= new ProductContext();
                prod2.productId = 2;
            component.prodList.push(prod1);
            component.prodList.push(prod2);
            let product1 = { PrdID: '3', Name: 'test1' };
            let product2 = { PrdID: '4', Name: 'test2' };
            let products = [product1,product2];
            component.ProductAssginedSelectedAll(products);
            expect(component.prodList.length).toEqual(2);
            expect(component.UsrSelectedProds.length).toEqual(0);
        });
    });
    describe('ProductAssginedSelectedDeAll', () => {
        it('should have the ProductAssginedSelectedDeAll being called when the product is all deselect ', () => {
            let prod1 = new ProductContext();
                prod1.productId = 1;
            let prod2= new ProductContext();
                prod2.productId = 2;
            component.UsrSelectedProds.push(prod1);
            component.UsrSelectedProds.push(prod2);
            component.ProductAssginedSelectedDeAll(component.UsrSelectedProds);
            expect(component.UsrSelectedProds.length).toEqual(0);
        });
    });
    describe('ProductAssginedSelectedOne', () => {
        it('should have the ProductAssginedSelectedOne being called when the product is select ', () => {
            let prod1 = new ProductContext();
                prod1.productId = 1;
            let prod2= new ProductContext();
                prod2.productId = 2;
            component.prodList.push(prod1);
            component.prodList.push(prod2);
           
            let product1 = { PrdID: '3', Name: 'test1' };
            component.ProductAssginedSelectedOne(product1);
            expect(component.prodList.length).toEqual(2);
            expect(component.UsrSelectedProds.length).toEqual(0);
        });
    });
    describe('ProductAssginedSelectedDeOne', () => {
        it('should have the ProductAssginedSelectedDeOne being called when the product is deselect ', () => {
            let prod1 = new ProductContext();
            prod1.productId = 1;
            let prod2= new ProductContext();
                prod2.productId = 2;
            component.UsrSelectedProds.push(prod1);
            component.UsrSelectedProds.push(prod2);
            let product1 = { PrdID: '3', Name: 'test1' };
            component.ProductAssginedSelectedDeOne(product1);
            expect(component.UsrSelectedProds.length).toEqual(2);
        });
    });
    describe('onUserEditClick', () => {
        it('should call onUserEditClick function on click cancel button. Then the modal should open', () => {

            component.adminUserForm.setValue({FIID: 0, FirstName: "AABFN45", LastName: "AABLN45123", Email: "bb@abc.com", Username: 'Test', FIName: '', MainframeFIID: '123', Phone: '1234567890', Phone2: '1234567890', ProductAssigned: [1], Role: 'Admin', Extension: '12345', PasswordStatus: 'Active'});
            let user:any = [];
            user.UsrID = 1
            user.Username = 'test';
            user.FirstName = 'test';
            user.LastName = 'test';
            user.ProductName = "Introduction";
            user.PrdID = [1];
            user.SameIdUsers = [];
            user.FIID = 0;
            user.FIName = '';
            user.Email = 'bb@bb.com';
            user.Phone = '1234567890';
            user.Phone2 = '1234567890';
            user.Role = 'Admin';
            user.PasswordStatus = false;
            user.Extension = '12345';

            let ndata = {data: user}
            component.onUserEditClick(ndata, '');
            expect(component.adminUserModal.isOpen).toEqual(true);
            expect(component.adminUserForm.value.FirstName).toEqual('test');
        });

    });
    describe('numberFormatter', () => {
        it('should change 1234567890 to (123) 456-7890', () => {
            
           let resp =  component.numberFormatter({value: '1234567890'});
            expect(resp).toEqual('(123) 456-7890');
        });
    });
});
