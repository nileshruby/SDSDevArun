import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { DialogService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, ProductService, AccountService, FiService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { LocalModalComponent, DatePickerComponent } from '@app/modules/shared/components';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import * as _ from 'lodash';
import { TransactionActivityPage } from '..';
import { PRODUCT_IDS } from '@app/entities/product-ids';
import * as moment from 'moment';
import { UrlResolver } from '@app/services/url-reolver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { SingletonService } from '@app/services/singleton.svc';

describe('TransactionActivityPage', () => {

    let component: TransactionActivityPage;
    let fixture: ComponentFixture<TransactionActivityPage>;
    let injector;
    let _productSvc: ProductService;
    let _sessionSvc: SessionService;
    let _toastr: ToastrService;
    let formattedModal: LocalModalComponent;
    let rowDetailModal: LocalModalComponent;
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
            TransactionActivityPage,
            LocalModalComponent,
            DatePickerComponent,
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
            FormBuilder,
            UrlResolver,
            { provide: ActivatedRoute, useValue: fakeActivatedRoute },
            SingletonService
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
            NO_ERRORS_SCHEMA,
        ]
        }).compileComponents();

        fixture         = TestBed.createComponent(TransactionActivityPage);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        _productSvc        = injector.get(ProductService);
        _sessionSvc     = injector.get(SessionService);
        _toastr         = injector.get(ToastrService);
        formattedModal  = fixture.componentInstance.formattedModal;
        fixture.detectChanges();
    }));
    
    it('should create', () => {
        PRODUCT_IDS.CRDMNT = 3;
        expect(component).toBeTruthy();
    });
    describe('ngOnInit', () => {
        it('should call ngOnInit function', () => {

            PRODUCT_IDS.CRDMNT = 3;
            let data = [
                {serviceId: '1', name: 'test', serviceName: 'stest'},
                {serviceId: '1', name: 'test', serviceName: 'stest'}
            ];
            let date = new Date();
            let response = {data:data,  "expiration": date, "errorMessages": [], "flags": [] };
            spyOn(_productSvc, 'getServiceIDs').and.returnValue(of(response));
            component.ngOnInit();
            expect(component.svcInstances.length).toEqual( 2 );
        });
    });

    describe('onGridFilter', () => {
        it('should call onGridFilter function on search any keyword time and return search result.', () => {
            let sd:any = {}
                sd.id = 1;
                sd.fileName = 'test';
                sd.text = 'test';
            component.items = [sd];
            component.onGridFilter('test', datatable);

            expect(component.items[0].fileName).toEqual( 'test' );
        });
    });

    describe('onSearchFormSubmit', () => {

        it('should return Invalid date error. if searchForm date is invalid', () => {
            component.searchForm.setValue({
                serviceId: '',
                bin: "", 
                pan: "", 
                wholeDaySearch: false,
                searchDate: "",
                startTime: "",
                endTime: "",
            });
            const spyDisplayToastMsg = spyOn(_toastr, 'error').and.stub();
            let reps = component.onSearchFormSubmit('');
            expect(reps).toBeUndefined();
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

        it('should have the  onSearchFormSubmit being called when the form is submited.', () => {
            let toDate = new Date();
            component.searchForm.setValue({
                serviceId: [{sviID : 'PSCUDXSVC_5500A' }],
                bin: "", 
                pan: "", 
                wholeDaySearch: false,
                searchDate:  moment(toDate),
                startTime: "01:00 pm",
                endTime: "03:00 pm",
            });
            component.lastSearchParams = {};
            component.items  = [];
            let sd: any = {};
                sd.serviceId = 'PSCUDXSVC_5500A';
                sd.fileServer = 'loge';
                sd.items = [{
                    id: 1,
                    fileName: 'test',
                    text: 'desc',
                    timeStamp: "2019-09-06T02:00:00.000Z"
                }];
            let date = new Date();
            let response = {data:sd,  "expiration": date, "errorMessages": [], "flags": [] }
            const spyOnSaveUser = spyOn(_productSvc, 'searchTransactionActivity').and.returnValue(of(response));
            component.onSearchFormSubmit('');
            expect(spyOnSaveUser).toHaveBeenCalled();
            expect(component.items[0].fileName).toEqual('test');
        });
    });
    
    describe('onFormReset', () => {
        it('should reset the form.', () => {
            let toDate = new Date();
            component.searchForm.setValue({
                serviceId: ['PSCUDXSVC_5500A'],
                bin: "", 
                pan: "", 
                wholeDaySearch: false,
                searchDate:  moment(toDate),
                startTime: "01:00 pm",
                endTime: "03:00 pm",
            });
            let sd: any = {};
            sd.serviceId = 'PSCUDXSVC_5500A';
            sd.fileServer = 'loge';
            sd.items = [{
                id: 1,
                fileName: 'test',
                text: 'desc',
                timeStamp: "2019-09-06T02:00:00.000Z"
            }];
            component.items = [sd];
            component.onFormReset();
            expect(component.items.length).toEqual(0);
            expect(component.searchForm.controls['serviceId'].value).toEqual('');
        });
    });

    describe('onTimeChange', () => {
        it('should change the end time list if the select start time', () => {
            let toDate = new Date();
            component.searchForm.setValue({
                serviceId: ['PSCUDXSVC_5500A'],
                bin: "", 
                pan: "", 
                wholeDaySearch: false,
                searchDate:  moment(toDate),
                startTime: "01:00 pm",
                endTime: "03:00 pm",
            });
            component.onTimeChange('start');
            // console.log(component.endTimes);
            expect(component.endTimes.length).toBeLessThanOrEqual(4);
        });
        it('should change the start time list if the select end time', () => {
            let toDate = new Date();
            component.searchForm.setValue({
                serviceId: ['PSCUDXSVC_5500A'],
                bin: "", 
                pan: "", 
                wholeDaySearch: false,
                searchDate:  moment(toDate),
                startTime: "01:00 pm",
                endTime: "03:00 pm",
            });
            component.onTimeChange('end');
            expect(component.startTimes.length).toBeLessThanOrEqual(3);
        });
    });

    describe('onFormattedModalCloseClick', () => {
        it('should close the formattedModal.', () => {
            component.onFormattedModalCloseClick();
            expect(component.formattedModal.isOpen).toEqual(false);
        });
    });

});
