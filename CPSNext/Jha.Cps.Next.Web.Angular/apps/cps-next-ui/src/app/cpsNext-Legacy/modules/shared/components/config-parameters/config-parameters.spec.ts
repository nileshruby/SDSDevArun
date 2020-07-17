import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { DialogService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, ProductService, AccountService, FiService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { LocalModalComponent } from '@app/modules/shared/components';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import * as _ from 'lodash';
import { UserContext } from '@app/entities/user-context';
import { IUserEmailResponse } from '@app/models/user-email';
import { UrlResolver } from '@app/services/url-reolver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigParametersPage } from './config-parameters.page';
import { SingletonService } from '@app/services/singleton.svc';
import { TableModule } from 'primeng/table';
const formBuilder: FormBuilder = new FormBuilder();
describe('ConfigParametersPage', () => {
    let component: ConfigParametersPage;
    let fixture: ComponentFixture<ConfigParametersPage>;
    let injector;
    let _prodSvc: ProductService;
    let _accountSvc: AccountService;
    let _sessionSvc: SessionService;
    let toastrService: ToastrService;
    let dialogService: DialogService;
    let configModal: LocalModalComponent;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let mainframeId: DebugElement;
    let inputEl: DebugElement;
    let datatable: ElementRef;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ConfigParametersPage,
                LocalModalComponent,
            ],
            imports: [
                CommonModule,
                ReactiveFormsModule,
                HttpClientModule,
                HttpClientTestingModule,
                ToastrModule.forRoot(),
                NgMultiSelectDropDownModule.forRoot(),
                SweetAlert2Module.forRoot(),
                FormsModule,
                MatSlideToggleModule,
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
                {provide: FormBuilder, useValue: formBuilder},
                UrlResolver,
                SingletonService
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();

        fixture         = TestBed.createComponent(ConfigParametersPage);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        _prodSvc        = injector.get(ProductService);
        _accountSvc     = injector.get(AccountService);
        _sessionSvc     = injector.get(SessionService);
        toastrService   = injector.get(ToastrService);
        dialogService   = injector.get(DialogService);
        configModal  = fixture.componentInstance.configModal;
        fixture.detectChanges();
    }));

    it('should be created', () => {
        component.productId = 3;
        let udata = new UserContext();
            udata.isAuthenticated = true;
            udata.assginedProducts = [];
            udata.userId = 1;
            udata.username = 'test';
        component._userDetails = udata;
        spyOn(_sessionSvc, 'get').and.returnValue(of(udata));
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call ngOnInit function', () => {
            component.productId = 3;
            let udata = new UserContext();
            udata.isAuthenticated = true;
            udata.assginedProducts = [];
            udata.userId = 1;
            udata.username = 'test';
            component._userDetails = udata;
            let productData:any = [{
                PCID: 1,
                PrdID: 1,
                Config_Key: "test",
                Config_Value: "123",
                DataType: 'string'
            }, {
                PCID: 2,
                PrdID: 2, 
                Config_Key: "test 2",
                Config_Value: "tets 123",
                DataType: 'string'
            }];
            spyOn(_sessionSvc, 'get').and.returnValue(of(udata));
            let date = new Date();
            spyOn(_prodSvc, 'getProductConfigParameter').and.returnValue(of({Data: productData,  "Expiration": date, "ErrorMessages": [], "Flags": [] }));
            component.ngOnInit();
            expect(component.items.length).toEqual( 2 );
        });
    });

    describe('onGridFilter', () => {
        it('should call on Search function on search any keyword time and return search result.', () => {
            let productData = [{
                PCID: 1,
                PrdID: 1,
                Config_Key: "test",
                Config_Value: "123",
                DataType: 'string',
                IsRequired: true,
                Config_Value_Option: 'string',
                CreateBy: 'test',
                CreateDateTime: '',
                UpdateBy: 'test',
                UpdateDateTime: '',
            }, {
                PCID: 2,
                PrdID: 2, 
                Config_Key: "test 2",
                Config_Value: "tets 123",
                DataType: 'string',
                IsRequired: true,
                Config_Value_Option: 'string',
                CreateBy: 'test',
                CreateDateTime: '',
                UpdateBy: 'test',
                UpdateDateTime: '',
            }];
            component.items = productData
            component.onGridFilter('test', datatable);
            expect(component.items[0].Config_Key).toEqual( 'test' );
        });
    });

    describe('onConfigParamAddClick', () => {
        it('should add config param on grid if click the onConfigParamAddClick', () => {
            component.onConfigParamAddClick();
            expect(component.configModal.isOpen).toEqual(true)
        });
    });

    describe('onCfgCancelClick', () => {
        it('should close model. if click the onCfgCancelClick', () => {
            component.onCfgCancelClick();
            expect(component.configModal.isOpen).toEqual(false)
        });
    });

    describe('getGridData', () => {
        it('should get config if call the getGridData function', () => {
            component.productId = 3;
            let productData = [{
                PCID: 1,
                PrdID: 1,
                Config_Key: "test",
                Config_Value: "123",
                DataType: 'string'
            }, {
                PCID: 2,
                PrdID: 2, 
                Config_Key: "test 2",
                Config_Value: "tets 123",
                DataType: 'string'
            }];
            let date = new Date();
            spyOn(_prodSvc, 'getProductConfigParameter').and.returnValue(of({Data: productData,  "Expiration": date, "ErrorMessages": [], "Flags": [] }));
            component.getGridData();
            expect(component.items.length).toEqual( 2 );
        });
    });

    describe('onConfigParamClick', () => {
        it('should edit FI if click the onConfigParamClick', () => {
            let data ={data: {
                PCID: 1,
                DataType: 'Boolean',
                Config_Key: 'test g',
                Config_Value: false,
                IsRequired: false
            }};
            component.onConfigParamClick(data, '');
            expect(component.configModal.isOpen).toEqual(true);
        });
    });

    describe('onCfgSaveClick', () => {
        it('should return Invalid data warning.', () => {
            component.cfgForm = formBuilder.group({
                DataType: new FormControl('', Validators.required),
                Config_Key: new FormControl('', Validators.required),
                Config_Value: new FormControl(true),
                IsRequired: new FormControl(false),
                Config_Value_Option: ''
              });
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.onCfgSaveClick();
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

        it('should have the  onCfgSaveClick being called when the form is submited.', () => {
            
            component.cfgForm = formBuilder.group({
                DataType: new FormControl('boolean', Validators.required),
                Config_Key: new FormControl('TEST', Validators.required),
                Config_Value: new FormControl(true),
                IsRequired: new FormControl(false),
                Config_Value_Option: ''
              });
           
            let f1 = {  PCID: 1,
                        PrdID: 1,
                        Config_Key: "TEST",
                        Config_Value: true,
                        DataType: 'boolean'
                    };
            let date = new Date();
            let response = {data:[f1],  "expiration": date, "errorMessages": [], "flags": [] }
            const spyOnSaveUser = spyOn(_prodSvc, 'saveUpdateConfigBackend').and.returnValue(of(response));
            const spyDisplayToastMsg = spyOn(toastrService, 'success').and.stub();
            component.onCfgSaveClick();
            expect(spyOnSaveUser).toHaveBeenCalled();
            expect(spyDisplayToastMsg).toHaveBeenCalled();
            expect(component.configModal.isOpen).toEqual(false);
        });
    });
});
