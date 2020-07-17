import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, Validators, FormControl, FormBuilder } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { DialogService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, ProductService, FiService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import {  LocalModalComponent } from '@app/modules/shared/components';
import { ProductContext, UserDetailContext, FiContext, IConfigItem } from '@app/entities/models';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import * as _ from 'lodash';
import { UserContext } from '@app/entities/user-context';
import { IUserEmailResponse } from '@app/models/user-email';
import { FiOnboardingPage } from './fi-onboarding.page';
import { UrlResolver } from '@app/services/url-reolver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SingletonService } from '@app/services/singleton.svc';
import { TableModule } from 'primeng/table';

describe('FiOnboardingPage', () => {
    let component: FiOnboardingPage;
    let fixture: ComponentFixture<FiOnboardingPage>;
    let injector;
    let _prodSvc: ProductService;
    let _fiSvc: FiService;
    let _sessionSvc: SessionService;
    let toastrService: ToastrService;
    let dialogService: DialogService;
    let selectModal: LocalModalComponent;
    let fiModal: LocalModalComponent;
    let goLivefiModal: LocalModalComponent;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let mainframeId: DebugElement;
    let inputEl: DebugElement;
    const formBuilder: FormBuilder = new FormBuilder();
    let datatable: ElementRef;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                FiOnboardingPage,
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
                FiService,
                {provide: FormBuilder, useValue: formBuilder},
                UrlResolver,
                SingletonService
                
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();

        fixture         = TestBed.createComponent(FiOnboardingPage);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        _prodSvc        = injector.get(ProductService);
        _fiSvc          = injector.get(FiService);
        _sessionSvc     = injector.get(SessionService);
        toastrService   = injector.get(ToastrService);
        dialogService   = injector.get(DialogService);
        selectModal  = fixture.componentInstance.selectModal;
        fiModal  = fixture.componentInstance.fiModal;
        goLivefiModal  = fixture.componentInstance.goLivefiModal;
        fixture.detectChanges();
    }));

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call ngOnInit function', () => {
            let f1= new FiContext();
                f1.fiId = 100005;
            let f2= new FiContext();
                f2.fiId = 12222;
            let fiList = [f1, f2];
            let date = new Date();
            spyOn(_fiSvc, 'getFIs').and.returnValue(of({data: fiList,  "expiration": date, "errorMessages": [], "flags": []}));
            spyOn(_prodSvc, 'getProductFIs').and.returnValue(of( { data: [100005, 100007],  "expiration": date, "errorMessages": [], "flags": []} ));
            component.ngOnInit();
            expect(component.productFiList.length).toEqual( 1 );
            expect(component.fiSelectList.length).toEqual( 1 );
        });
    });

    describe('onSearch', () => {
        it('should call on Search function on search any keyword time and return search result.', () => {
            let productFiList = new FiContext();
                productFiList.fiId= 100005;
                productFiList.fiName = 'test';
            component.productFiList = [productFiList];
            component.onSearch('test', null);
            expect(component.productFiList[0].fiName).toEqual( 'test' );
        });
    });

    describe('onFiAddClick', () => {
        it('should add fi on grid if click the onFiAddClick', () => {
            component.onFiAddClick('');
            expect(component.selectModal.isOpen).toEqual(true)
        });
    });

    describe('onFiEditClick', () => {
        it('should edit FI if click the onFiEditClick', () => {
            let fi = new FiContext();
                fi.fiId = 10002;
                fi.fiName = 'test';
            let data ={data: fi};

            let f1 = {  configId: 1,
                        categoryId: 1,
                        entityId: 22,
                        key: 'test',
                        value: 'tesd',
                        dataType: 'List',
                        isProductConfig: true,
                        isRequired: true
                    };
               
            let data1 = [f1];
            component.fiEditing = fi;
            let date = new Date();
            spyOn(_prodSvc, 'getFiConfigs').and.returnValue(of({data: data1,  "expiration": date, "errorMessages": [], "flags": []}));
            spyOn(_prodSvc, 'retrieveFILiveStatus').and.returnValue(of( { data: {isEnabled: true},  "expiration": date, "errorMessages": [], "flags": []} ));
            component.onFiEditClick(data);
            expect(component.fiModal.isOpen).toEqual(true);
            expect(component.liveStatus).toEqual('Live');
        });
    });

    describe('onFiAddSearch', () => {
        it('should call on Search function on search any keyword time and return search result.', () => {
            let fiSelectList = new FiContext();
                fiSelectList.fiId= 100005;
                fiSelectList.fiName = 'test';
            component.fiSelectList = [fiSelectList];
            component.onFiAddSearch('test', datatable);
            expect(component.fiSelectList[0].fiName).toEqual( 'test' );
        });
    });

    describe('onFiSelectClick', () => {
        it('should select FI if click the onFiSelectClick', () => {
            let fi = new FiContext();
                fi.fiId = 10002;
                fi.fiName = 'test';
            let data ={data: fi};
           
            component.fiEditing = fi;
            let date = new Date();
            spyOn(_prodSvc, 'onBoardFiProduct').and.returnValue(of( { data: [100005],  "expiration": date, "errorMessages": [], "flags": [] } ));
            component.onFiSelectClick(data, '');
            expect(component.selectModal.isOpen).toEqual(false);
        });
    });

    describe('onSelectCancelClick', () => {
        it('should cancel selectction if click the onSelectCancelClick', () => {
            component.onSelectCancelClick();
            expect(component.selectModal.isOpen).toEqual(false)
        });
    });

    describe('onFiEditCloseClick', () => {
        it('should close edit FI model if click the onFiEditCloseClick', () => {
            component.onFiEditCloseClick('', '');
            expect(component.goingLiveChange).toEqual(false)
        });
    });

    describe('onGoLiveEditClose', () => {
        it('should go live if States is false', () => {
            component.goLiveState = false;
            component.onGoLiveEditClose('');
            expect(component.liveStatus).toEqual('Live')
            expect(component.goLivefiModal.isOpen).toEqual(false)
        });
    });

    describe('onCommentSave', () => {
        it('should return Invalid data warning. if goLiveComment less than to 20 characters', () => {
            component.goLiveComment = 'test';
            const spyDisplayToastMsg = spyOn(toastrService, 'warning').and.stub();
            component.onCommentSave('');
            expect(component.goLiveComment.length).toBeLessThan(20);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

        it('should have the  onCommentSave being called when the form is submited.', () => {
            
            component.goLiveComment = 'test test test test test test test';
            component.goLiveState = true;
            const spyOnSaveUser = spyOn(_prodSvc, 'addUpdateFIProductMapping').and.returnValue(of(null));
            let fi = new FiContext();
                fi.fiId = 10002;
                fi.fiName = 'test';
            component.fiEditing = fi;
            let udata = new UserContext();
                udata.isAuthenticated = true;
                udata.assginedProducts = [];
                udata.userId = 1;
                udata.username = 'test';
            component.userContext = udata;

            component.onCommentSave('');
            expect(spyOnSaveUser).toHaveBeenCalled();
            expect(component.goLiveState).toEqual(false);
            expect(component.liveStatus).toEqual('Go Live');
        });
    });

    describe('onCfgEditClick', () => {
        it('should edit cfg if click the onCfgEditClick', () => {
            let f1 = {  configId: 1,
                        categoryId: 1,
                        entityId: 22,
                        key: 'test',
                        value: 'Y',
                        dataType: 'boolean',
                        isProductConfig: true,
                        isRequired: true,
                        config_Value_Option: '1,2,3',
            };
            component.fiConfigs = [f1];
            component.onCfgEditClick(1);
            expect(component.cfgEditForm.controls['configId'].value).toEqual(1);
        });
    });

    describe('onCfgSaveClick', () => {
        it('should return Invalid data warning. if goLiveComment less than to 20 characters', () => {
            component.cfgAddForm = formBuilder.group({
                dataType: new FormControl('boolean', Validators.required),
                key: new FormControl('', Validators.required),
                value: new FormControl(true),
                isRequired: new FormControl(false),
                Config_Value_Option: ''
              });
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.onCfgSaveClick();
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

        it('should have the  onCfgSaveClick being called when the form is submited.', () => {
            component.IsTouched = true;
            component.cfgAddForm = formBuilder.group({
                dataType: new FormControl('boolean', Validators.required),
                key: new FormControl('TEST', Validators.required),
                value: new FormControl(true),
                isRequired: new FormControl(false),
                Config_Value_Option: ''
              });
            let fi = new FiContext();
                fi.fiId = 10002;
                fi.fiName = 'test';
            component.fiEditing = fi;
            let f1 = {  configId: 1,
                        categoryId: 1,
                        entityId: 22,
                        key: 'test',
                        value: 'Y',
                        dataType: 'boolean',
                        isProductConfig: true,
                        isRequired: true
                    };
            let date = new Date();
            const spyOnSaveUser = spyOn(_prodSvc, 'saveConfig').and.returnValue(of({data: [f1],  "expiration": date, "errorMessages": [], "flags": [] }));
            component.onCfgSaveClick();
            expect(spyOnSaveUser).toHaveBeenCalled();
            expect(component.fiConfigs[0].configId).toEqual(1);
        });
    });

});
