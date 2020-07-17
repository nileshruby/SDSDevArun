import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { GA_FiAdminPage } from '..';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { DialogService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, FiService, ProductService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { LocalModalComponent } from '@app/modules/shared/components';
import { FiContext, BinContext } from '@app/entities/models';
import { UserContext } from '@app/entities/user-context';
import { UrlResolver } from '@app/services/url-reolver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SingletonService } from '@app/services/singleton.svc';
import { TableModule } from 'primeng/table';

describe('GA_FiAdminPage', () => {
    let component: GA_FiAdminPage;
    let fixture: ComponentFixture<GA_FiAdminPage>;
    let injector;
    let fiService: FiService;
    let toastrService: ToastrService;
    let _sessionSvc: SessionService;
    let _prodSvc: ProductService;
    let dialogService: DialogService;
    let fiModal: LocalModalComponent;
    let binModal: LocalModalComponent;
    let rowDetailModal: LocalModalComponent;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let mainframeId: DebugElement;
    const formBuilder: FormBuilder = new FormBuilder();
    let datatable: ElementRef;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GA_FiAdminPage,
                LocalModalComponent,
            ],
            imports: [
                CommonModule,
                ReactiveFormsModule,
                HttpClientModule,
                HttpClientTestingModule,
                ToastrModule.forRoot(),
                TableModule
            ],
            providers: [
                DialogService,
                FiService,
                HelpersService,
                SessionService,
                HttpBaseService,
                LoggingService,
                VaultService,
                ToastrService,
                ProductService,
                {provide: FormBuilder, useValue: formBuilder},
                UrlResolver,
                SingletonService
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();

        fixture         = TestBed.createComponent(GA_FiAdminPage);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        fiService       = injector.get(FiService);
        _sessionSvc       = injector.get(SessionService);
        _prodSvc       = injector.get(ProductService);
        toastrService   = injector.get(ToastrService);
        dialogService   = injector.get(DialogService);
        fiModal         = fixture.componentInstance.fiModal;
        binModal        = fixture.componentInstance.binModal;
        rowDetailModal        = fixture.componentInstance.rowDetailModal;
        // Fnums.group();
        fixture.detectChanges();
    }));

    it('should be created', async(() => {
        component.viewData = {
            binNumber: 1234567,
            icaNumber: 1234,
            sharedSys: true,
            panPattern: '123g',
        };
        expect(component).toBeTruthy();
    }));

    describe('ngOnInit', () => {
        it('should call ngOnInit function', () => {
            component.ngOnInit();
            expect(component.isValidBin).toBe(false);
        });
    });

    describe('onSearch', () => {
        it('should have the search product', () => {
            let fi = new FiContext();
            fi.fiId = 1;
            fi.fiName = 'test';
            fi.fiNameShort = 'test';
            component.items = [fi];
            component.onSearch('test', datatable);
            expect(component.items[0].fiName).toEqual('test');
        });
    });

    describe('clearText', () => {
        it('should clear Text', () => {
            component.searchText = 'test';
            component.clearText();
            expect(component.searchText).toEqual('');
        });
    });

    describe('onFiCreateClick', () => {
        it('should return. if modal is already opened. and if the modal is not open so should  open', () => {
            component.fiModal.open;
            const event = new MouseEvent('click'); 
            spyOn(event, 'preventDefault');
            expect(component.onFiCreateClick(event)).toBeUndefined();
        });
    });

    describe('onFiEditClick', () => {
        it('should have the edit Fi Context when the form is onFiEditClick', () => {
            let fi = new FiContext();
            fi.fiId = 1;
            fi.aba = '56346';
            fi.fiName = 'test';
            fi.fiNameShort = 'test';
            fi.mainframeId = '1';
            fi.isFdcMigrated = true;
            fi.pscuClientId = '1';
            fi.address = 'test';
            fi.city = 'test';
            fi.state = 'test';
            fi.zip = '1234';
            let fiContent = {data:fi}
            component.onFiEditClick(fiContent);
            expect(component.fiEditing.fiId).toBe(fiContent.data.fiId);
        });
    });

    describe('onBinEditClick', () => {
        it('should have the edit bin Context when the form is onBinEditClick', () => {
            let fi = new BinContext();
            fi.fiId = 1;
            fi.binId = 1;
            fi.binNumber = '785678';
            fi.merchantNum = '765467';
            fi.pscuPrincipalNum = '456456';
            fi.pscuSysNum = '14645';
            let binContext = {data:fi}
            component.onBinEditClick(binContext);
            expect(component.action).toBe('Edit');
            
        });
    });

    describe('onProdSaveClick', () => {
        it('should return Invalid data error. if the form is empty.', () => {
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.fiForm = new FormGroup({
                fiName: new FormControl('', Validators.required),
                aba: new FormControl('', Validators.required),
              });
            component.onFiSaveClick();
            expect(component.fiForm.invalid).toBe(true);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });


        it('should return an error. if ABA Number count is not equal to 9.', () => {
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.fiForm.setValue(
                {
                    fiName: 'test',
                    aba: '12345678',
                    fiId: 1,
                    pscuClientId: '1',
                    mainframeId: '12',
                    isFdcMigrated: false,
                    fiNameShort: 'test',
                    address: 'test',
                    state: 'zp',
                    city: 'test',
                    zip: '12345',
                    zip4: '1234'
                });
            component.fiEditing = new FiContext();
            component.onFiSaveClick();
            expect(component.fiForm.invalid).toBe(false);
            expect(spyDisplayToastMsg).toHaveBeenCalled();

        });

        it('should have the onFiSaveClick being called when the form is submited', () => {

            component.items = [];
            component.fiForm.setValue(
                {
                    fiName: 'test',
                    aba: '123456789',
                    fiId: 1,
                    pscuClientId: '1',
                    mainframeId: '12',
                    isFdcMigrated: false,
                    fiNameShort: 'test',
                    address: 'test',
                    state: 'zp',
                    city: 'test',
                    zip: '12345',
                    zip4: '1234'
                });
            component.fiEditing = new FiContext;
            
            let data = new FiContext();
            data.fiName = 'test';
            data.aba = '123456789';
            data.fiId = 1;
            let date = new Date();
            let response = {data:data, "expiration": date, "errorMessages": [], "flags": []};
            const spyOnSaveProduct = spyOn(fiService, 'saveFi').and.returnValue(of(response));
            component.onFiSaveClick();
            component.fiModal.close();
            expect(spyOnSaveProduct).toHaveBeenCalled();
            expect(component.items[0].fiName).toEqual('test');
        });
    });

    describe('onFiCancelClick', () => {
        it('should close modal when calling onFiCancelClick', () => {
            let data = new FiContext();
            data.fiName = 'test';
            data.aba = '12345678';
            data.fiId = 1;
            component.fiEditing = data;
            component.fiModal.close();
            component.onFiCancelClick(data, '');
            expect(component.fiEditing).toBeNull();
        });
    });

    describe('onBinCreateClick', () => {
        it('should open bin create modal when calling oninCreateClick.', async(() => {
            let data = new BinContext();
            data.fiId = 1;
            let binContext = {data:data}
            component.onBinCreateClick(binContext);
            component.binModal.open();
            expect(component.action).toBe('Add');
        }));
    });

    describe('onBinSaveClick', () => {
        it('should return valid BIN error. if bin number is less than to 6 and greater than to 9.', () => {
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.binForm = new FormGroup({
                BinNumber: new FormControl('123', Validators.required),
                pscuPrincipalNum: new FormControl('', Validators.required),
                pscuSysNum: new FormControl('', Validators.required),
                fiId: new FormControl('1', Validators.required),
                Nums: formBuilder.array([ formBuilder.group({ BnsId: 0, PscuSysNum: '', PscuPrinNum: '', AgentNum: '', MerchantNum: '', EditMod: true }) ])
              });
            component.onBinSaveClick();
            expect(component.binForm.invalid).toBe(true);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });
        it('should return Invalid data error. if the form in passe invalid data.', () => {
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.binForm = new FormGroup({
                BinNumber: new FormControl('12365789166', Validators.required),
                pscuPrincipalNum: new FormControl('123', Validators.required),
                pscuSysNum: new FormControl('123', Validators.required),
                fiId: new FormControl('1', Validators.required),
                Nums: formBuilder.array([ formBuilder.group({ BnsId: 0, PscuSysNum: '12', PscuPrinNum: '12', AgentNum: '12', MerchantNum: '', EditMod: true }) ])
              });
            let udata = new UserContext();
                udata.isAuthenticated = true;
                udata.assginedProducts = [];
                udata.userId = 1;
                udata.username = 'test';
                component._userDetails = udata;
            spyOn(_sessionSvc, 'get').and.returnValue(of(udata));
            component.onBinSaveClick();
            expect(component.binForm.invalid).toBe(false);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });
        it('should have the onFiSaveClick being called when the form is submited', () => {
            let fi = new FiContext();
            fi.fiId = 1;
            fi.fiName = 'test';
            fi.fiNameShort = 'test';
            component.items = [fi];
            component.binForm = new FormGroup({
                BinNumber: new FormControl('123654', Validators.required),
                pscuPrincipalNum: new FormControl('1234', Validators.required),
                pscuSysNum: new FormControl('1234', Validators.required),
                merchantNum: new FormControl('1234', Validators.required),
                fiId: new FormControl('1', Validators.required),
                Nums: formBuilder.array([ formBuilder.group({ BnsId: 0, PscuSysNum: '', PscuPrinNum: '', AgentNum: '', MerchantNum: '', EditMod: true }) ])
              });
            
            let udata = new UserContext();
                udata.isAuthenticated = true;
                udata.assginedProducts = [];
                udata.userId = 1;
                udata.username = 'test';
                component._userDetails = udata;
            spyOn(_sessionSvc, 'get').and.returnValue(of(udata));

            let data: any = new BinContext();
            data.binId = 1;
            data.fiId = 1;
            data.binNumber = '123456789';
            data.merchantNum = '1234';
            data.pscuPrincipalNum = '1234';
            data.pscuSysNum = '1234';
            let date = new Date();
            let response = {Resp_BinID:data, "expiration": date, "errorMessages": [], "flags": []}
            const spyDisplayToastMsg = spyOn(toastrService, 'success').and.stub();
            const spyOnSaveProduct = spyOn(fiService, 'SaveBinInformation').and.returnValue(of(response));
            component.onBinSaveClick();
            component.binModal.close();
            expect(spyOnSaveProduct).toHaveBeenCalled();
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });
    });

    describe('onBinCancelClick', () => {
        it('should close modal when calling onBinCancelClick', () => {
            let data = new BinContext();
            data.binId = 1;
            data.fiId = 1;
            data.binNumber = '123456789';
            data.merchantNum = '1234';
            data.pscuPrincipalNum = '1234';
            data.pscuSysNum = '1234';
            component.binModal.close();
            component.onBinCancelClick(data, '');
            expect(component.binEditing).toBe(false);
        });
    });

    describe('retrieveBinSetupDetails', () => {
        it('should call the retrieveBinSetupDetails() function', () => {
            let data = {
                BnsId : 1,
                PscuSysNum :'1243',
                PscuPrinNum : '1234',
                MerchantNum: '1243',
                AgentNum: '1243'
            }
            spyOn(fiService, 'RetrieveBinSetupInformation').and.returnValue(of([data]));
            component.retrieveBinSetupDetails(123456);
            expect(component.BinSetupDetailList[0].BnsId).toEqual(1);
        });

    });

    describe('retrieveIca', () => {
        it('should call the retrieveIca() function', () => {
            let data = {
                ICAID : 1,
                ICA :1243,
                ICA_Description : '1234',
                ICA_Type: '1243'
            }
            spyOn(_prodSvc, 'getICAMaintenance').and.returnValue(of([data]));
            component.retrieveIca();
            expect(component.mastercardICAList[0].ICAID).toEqual(1);
        });

    });

    describe('sharedSysChangeEvent', () => {
        it('should call the sharedSysChangeEvent() function', () => {
            let data = {
                target : {
                    checked: true
                }
            }
            component.sharedSysChangeEvent(data);
            expect(component.selectedSharedSys).toEqual(true);
        });

    });

    describe('getICAId', () => {
        it('should call the getICAId() function', () => {
            component.mastercardICAList = [{
                ICAID : 1,
                ICA :1234,
                ICA_Description : '1234',
                ICA_Type: '1243'
            }];
            component.getICAId('1234');
            expect(component.selectedMasterCardICAID).toEqual(1);
        });

    });
    describe('onBinAdditionalDetailCloseClick', () => {
        it('should call the onBinAdditionalDetailCloseClick() function', () => {
            component.onBinAdditionalDetailCloseClick();
            expect(component.rowDetailModal.isOpen).toEqual(false);
        });

    });

    describe('onExpandView', () => {
        it('should call the onExpandView() function', () => {
            let data = {
                data: {
                    BnsId : 1,
                    PscuSysNum :'1243',
                    PscuPrinNum : '1234',
                    MerchantNum: '1243',
                    AgentNum: '1243'
                }
            };
            component.onExpandView(data);
            expect(component.rowDetailModal.isOpen).toEqual(true);
        });

    });

});
