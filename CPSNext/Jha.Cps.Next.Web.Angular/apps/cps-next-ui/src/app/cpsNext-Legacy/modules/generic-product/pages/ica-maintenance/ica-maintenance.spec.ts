import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, ProductService, AccountService, FiService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { LocalModalComponent, DatePickerComponent } from '@app/modules/shared/components';
import { ICardICA, ICardFeeRateUpdateResponse } from '@app/entities/models';
import * as _ from 'lodash';
import { UserContext } from '@app/entities/user-context';
import { ICAMaintenancePage } from '..';
import { UrlResolver } from '@app/services/url-reolver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { SingletonService } from '@app/services/singleton.svc';
import { TableModule } from 'primeng/table';

describe('ICAMaintenancePage', () => {

    let component: ICAMaintenancePage;
    let fixture: ComponentFixture<ICAMaintenancePage>;
    let injector;
    let _prodSvc: ProductService;
    let _sessionSvc: SessionService;
    let _toastr: ToastrService;
    let MasterCardICAModal: LocalModalComponent;
    let element: HTMLElement;
    let datatable: ElementRef;
    beforeEach(async(() => {
        const fakeActivatedRoute = {
            parent: {snapshot: { params: {} } },
            snapshot: { data: { } },
            queryParams: of<Params>({ returnUrl: 'http://test.com', st: true })
          } as ActivatedRoute;
        TestBed.configureTestingModule({
        declarations: [
            ICAMaintenancePage,
            LocalModalComponent,
            DatePickerComponent,
        ],
        imports: [
            CommonModule,
            FormsModule,
            ReactiveFormsModule,
            HttpClientTestingModule,
            HttpClientModule,
            ToastrModule.forRoot(),
            TableModule
        ],
        providers: [
            ProductService,
            HttpBaseService,
            SessionService,
            VaultService,
            LoggingService,
            ToastrService,
            HelpersService,UrlResolver,
            { provide: ActivatedRoute, useValue: fakeActivatedRoute },
            SingletonService
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ],
        }).compileComponents();

        fixture = TestBed.createComponent(ICAMaintenancePage);
        component = fixture.componentInstance;
        injector = getTestBed();
        _prodSvc        = injector.get(ProductService);
        _sessionSvc     = injector.get(SessionService);
        _toastr   = injector.get(ToastrService);
        MasterCardICAModal        = fixture.componentInstance.MasterCardICAModal;
        fixture.detectChanges();
    }));
    
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('ngOnInit', () => {
        it('should call ngOnInit function', () => {
          
            component.items = []
            let udata = new UserContext();
                udata.isAuthenticated = true;
                udata.assginedProducts = [];
                udata.userId = 1;
                udata.username = 'test';
                component._userDetails = udata;
            spyOn(_sessionSvc, 'get').and.returnValue(of(udata));

            let ICAData = new ICardICA();
                ICAData.ICA = 123456;
                ICAData.ICAID = 1;
                ICAData.ICA_Description = 'test';
                ICAData.ICA_Type = 'test';

            let idata = [ICAData]
          
            let its = [it];
            
            const spyOnICAM = spyOn(_prodSvc, 'getICAMaintenance').and.returnValue(of(idata));
            component.ngOnInit();
            expect(spyOnICAM).toHaveBeenCalled();
            expect(component.items[0].ICA).toEqual( 123456 );
        });
    });

    describe('onSearch', () => {
        it('should call on Search function on search any keyword time and return search result.', () => {
            let ICAData = new ICardICA();
                ICAData.ICA = 123456;
                ICAData.ICA_Description = 'test';
                ICAData.ICA_Type = 'test';
            component.items = [ICAData];
            
            component.onSearch('test', datatable);

            expect(component.items[0].ICA_Description).toEqual( 'test' );
        });
    });

       
    describe('onICAEditClick', () => {
        it('should open edit form modal. When the onICAEditClick() function is called', () => {
            component.ICAEditing = false;
            component.newICA =  true;
            let ICAData = new ICardICA();
                ICAData.ICA = 123456;
                ICAData.ICAID = 1;
                ICAData.ICA_Description = 'test';
                ICAData.ICA_Type = 'test';
            let data = {data : ICAData};
            component.onICAEditClick(data);
            expect(component.MasterCardICAModal.isOpen).toEqual( true );
            expect(component.ICAEditing).toEqual( true );
            expect(component.newICA).toEqual( false );
            expect(component.icaForm.value.ICA_Description).toEqual( 'test' );
        });
    });
    
    describe('onICACreateClick', () => {
        it('should open create form modal. When the onICACreateClick() function is called', () => {
            component.ICAEditing = true;
            component.newICA =  false;
            component.onICACreateClick();
            expect(component.MasterCardICAModal.isOpen).toEqual( true );
            expect(component.ICAEditing).toEqual( false );
            expect(component.newICA).toEqual( true );
        });
    });
    
    describe('onICASaveClick', () => {

        it('should return Invalid data error. if icaForm invalid', () => {
            component.icaForm.setValue({ICAID: 0, ICA: 0, ICA_Description: 'test', ICA_Type: 'ap'});
            // component.icaForm.setValue({ICAID: 1, ICA: 123456, ICA_Description: 'test', ICATypeID: 1});
            const spyDisplayToastMsg = spyOn(_toastr, 'error').and.stub();
            component.onICASaveClick();
            expect(component.icaForm.invalid).toBe(true);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

        it('should have the onICASaveClick being called when the form is submitted and if ICAID is null so save ICA.', () => {
            let udata = new UserContext();
                udata.isAuthenticated = true;
                udata.assginedProducts = [];
                udata.userId = 1;
                udata.username = 'test';
                component._userDetails = udata;
            spyOn(_sessionSvc, 'get').and.returnValue(of(udata));

            component.icaForm.setValue({ICAID: 0, ICA: 123456, ICA_Description: 'test', ICA_Type: 'ap'});

            let data = new ICardFeeRateUpdateResponse();
                data.Add_Update = true;
                data.Tran_Type = "Add";
            const spyOnSaveICA = spyOn(_prodSvc, 'saveICAMaintenance').and.returnValue(of(data));
            const spyDisplayToastMsg = spyOn(_toastr, 'success').and.stub();

            component.onICASaveClick();
            component.MasterCardICAModal.close();
            expect(component.icaForm.invalid).toBe(false);
            expect(spyOnSaveICA).toHaveBeenCalled();
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });
        it('should have the onICASaveClick being called when the form is submitted and if ICAID is Not null so Edit ICA.', () => {
            let udata = new UserContext();
                udata.isAuthenticated = true;
                udata.assginedProducts = [];
                udata.userId = 1;
                udata.username = 'test';
                component._userDetails = udata;
            spyOn(_sessionSvc, 'get').and.returnValue(of(udata));

            component.icaForm.setValue({ICAID: 1, ICA: 123456, ICA_Description: 'test', ICA_Type: 'ap'});

            let data = new ICardFeeRateUpdateResponse();
                data.Add_Update = true;
                data.Tran_Type = "Update";
            const spyOnSaveICA = spyOn(_prodSvc, 'saveICAMaintenance').and.returnValue(of(data));
            const spyDisplayToastMsg = spyOn(_toastr, 'success').and.stub();

            component.onICASaveClick();
            component.MasterCardICAModal.close();
            expect(component.icaForm.invalid).toBe(false);
            expect(spyOnSaveICA).toHaveBeenCalled();
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });
    });

    describe('onICACancelClick', () => {
        it('should close form modal. When the onICACancelClick() function is called', () => {
            component.onICACancelClick();
            expect(component.MasterCardICAModal.isOpen).toEqual( false );
        });
    });

});
