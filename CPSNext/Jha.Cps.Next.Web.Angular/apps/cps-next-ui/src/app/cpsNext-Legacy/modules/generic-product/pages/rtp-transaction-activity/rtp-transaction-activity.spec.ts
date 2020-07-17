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
import { UserContext } from '@app/entities/user-context';
import { RTP_TransactionActivityPage } from '..';
import { PRODUCT_IDS } from '@app/entities/product-ids';
import * as moment from 'moment';
import { UrlResolver } from '@app/services/url-reolver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { SingletonService } from '@app/services/singleton.svc';

describe('RTP_TransactionActivityPage', () => {

    let component: RTP_TransactionActivityPage;
    let fixture: ComponentFixture<RTP_TransactionActivityPage>;
    let injector;
    let _productSvc: ProductService;
    let _sessionSvc: SessionService;
    let _toastr: ToastrService;
    let formattedModal: LocalModalComponent;
    let rowDetailModal: LocalModalComponent;
    let datatable: ElementRef;
    let element: HTMLElement;
    beforeEach(async(() => {
        const fakeActivatedRoute = {
            parent: {snapshot: { params: {} } },
            snapshot: { data: { } },
            queryParams: of<Params>({ returnUrl: 'http://test.com', st: true })
          } as ActivatedRoute;
        TestBed.configureTestingModule({
        declarations: [
            RTP_TransactionActivityPage,
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

        fixture         = TestBed.createComponent(RTP_TransactionActivityPage);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        _productSvc        = injector.get(ProductService);
        _sessionSvc     = injector.get(SessionService);
        _toastr         = injector.get(ToastrService);
        formattedModal  = fixture.componentInstance.formattedModal;
        rowDetailModal  = fixture.componentInstance.rowDetailModal;
        fixture.detectChanges();
    }));
    
    it('should create', () => {
        PRODUCT_IDS.CPSRTP = 3;
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

            PRODUCT_IDS.CPSRTP = 3;
            let data = [
                {serviceId: '1', name: 'test', serviceName: 'stest'},
                {serviceId: '2', name: 'test', serviceName: 'stest'}
            ];
            let date = new Date();
            let response = {data:data,  "expiration": date, "errorMessages": [], "flags": [] }
            spyOn(_productSvc, 'getServiceIDs').and.returnValue(of(response));
            component.ngOnInit();
            expect(component.svcInstances[0].serviceId).toEqual( '1' );
        });
    });

    describe('onGridFilter', () => {
        it('should call onGridFilter function on search any keyword time and return search result.', () => {
            let sd:any = {}
                sd.RtpTxnID = 22145;
                sd.FIID = 1;
                sd.BinNumber = 'test';
                sd.CardNumberLast4Digit = '78';
                sd.MerchantNum = '8978';
                sd.MainframeFIID = false;
                sd.Req_Amt = 8923;
                sd.Req_DrAcctType = 'jj';
                sd.Erroneous = 'true';
                sd.ErrorMessage = 'error msg';
                sd.CardNumber = '123';
                sd.Id = 1;
            component.items = [sd];
            
            component.onGridFilter('22145', datatable);

            expect(component.items[0].RtpTxnID).toEqual( 22145 );
        });
    });

    describe('onSearchFormSubmit', () => {

        it('should return Invalid date error. if searchForm date is invalid', () => {
            
            component.searchForm.setValue({
                serviceId: '',
                bin: "", 
                pan: "", 
                startDate: "",
                endDate: "2019-06-01T00:00:00.000Z",
                fiId: ""
            });
            const spyDisplayToastMsg = spyOn(_toastr, 'error').and.stub();
            let reps = component.onSearchFormSubmit('');
            expect(reps).toBeUndefined();
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

        it('should have the  onSearchFormSubmit being called when the form is submited.', () => {
            let currentDate = new Date();
            let fromDate = currentDate.setDate(currentDate.getDate()-1);
            let toDate = new Date();
            component.searchForm.setValue({
                serviceId: '',
                bin: "", 
                pan: "", 
                startDate: moment(fromDate),
                endDate: moment(toDate),
                fiId: ""
            });
            component.lastSearchParams = {};
            component.items  = [];
            let sd: any = {};
                sd.Id = 0;
                sd.RtpTxnID = 22145;
                sd.FIID = 1;
                sd.BinNumber = 'test';
                sd.CardNumberLast4Digit = '78';
                sd.MerchantNum = '8978';
                sd.MainframeFIID = false;
                sd.Req_Amt = 8923;
                sd.Req_DrAcctType = 'jj';
                sd.ErrorMessage = 'error msg';
                sd.CardNumber = '123';
                let date = new Date();
            let data = {
                    Data: [sd],
                    ErrorMessages: [],
                    "Expiration": date,
                    "Flags": []
                };
            const spyOnSaveUser = spyOn(_productSvc, 'searchRTPTransactionActivity').and.returnValue(of(data));
            component.onSearchFormSubmit('');
            expect(spyOnSaveUser).toHaveBeenCalled();
            expect(component.items[0].BinNumber).toEqual('test');
        });
    });

    describe('onFormReset', () => {
        it('should reset the form.', () => {
            component.searchForm.setValue({
                serviceId: '',
                bin: "", 
                pan: "", 
                startDate: "",
                endDate: "2019-06-01T00:00:00.000Z",
                fiId: ""
            });
            let sd: any = {};
                sd.Id = 0;
                sd.RtpTxnID = 22145;
                sd.FIID = 1;
                sd.BinNumber = 'test';
                sd.CardNumberLast4Digit = '78';
                sd.MerchantNum = '8978';
                sd.MainframeFIID = false;
                sd.Req_Amt = 8923;
                sd.Req_DrAcctType = 'jj';
                sd.ErrorMessage = 'error msg';
                sd.CardNumber = '123';
            component.items = [sd]
            component.onFormReset();
            expect(component.items.length).toEqual(0);
        });
    });

    describe('onFormattedModalCloseClick', () => {
        it('should close the formattedModal.', () => {
            component.onFormattedModalCloseClick();
            expect(component.formattedModal.isOpen).toEqual(false);
        });
    });

    describe('onTransactionDetailCloseClick', () => {
        it('should close the detailModal.', () => {
            component.onTransactionDetailCloseClick();
            expect(component.rowDetailModal.isOpen).toEqual(false);
        });
    });

    describe('onExpandView', () => {
        it('should have the  onExpandView being called and open detail Modal .', () => {
            
            let sd: any = {
                JxTran: {RtpTxnID: 1, TxnID: 1},
                PscuTran: {},
                JxTranMod: {}
            };
            
            let date = new Date();
            let response = {Data:sd,  "Expiration": date, "ErrorMessages": [], "Flags": [] }
            const spyOnSaveUser = spyOn(_productSvc, 'searchRTPTransactionActivityDetails').and.returnValue(of(response));
            component.onExpandView({data: {RtpTxnID: 1}});
            expect(spyOnSaveUser).toHaveBeenCalled();
            expect(component.rtpTransactionDetail.JxTran.TxnID).toEqual(1);
            expect(component.rowDetailModal.isOpen).toEqual(true);
        });
    });

    describe('showError', () => {
        it('should have the showError being called.', () => {
            component.showError('error');
            expect(component.ErrorMessagetootle).toEqual(true);
        });
    });

    describe('hideError', () => {
        it('should have the hideError being called.', () => {
            component.ErrorMessagetootle = true;
            component.hideError('error');
            expect(component.ErrorMessagetootle).toEqual(false);
        });
    });

    describe('showReverseDebitErrorPopup', () => {
        it('should have the showReverseDebitErrorPopup being called.', () => {
            component.showReverseDebitErrorPopup();
            expect(component.ReverseDebitErrorPopup).toEqual(true);
        });
    });

    describe('hideReverseDebitErrorPopup', () => {
        it('should have the hideReverseDebitErrorPopup being called.', () => {
            component.ReverseDebitErrorPopup = true;
            component.hideReverseDebitErrorPopup();
            expect(component.ReverseDebitErrorPopup).toEqual(false);
        });
    });

    describe('showPaymentError', () => {
        it('should have the showPaymentError being called.', () => {
            component.showPaymentError('error');
            expect(component.ErrorMessagePayment).toEqual(true);
        });
    });

    describe('hidePaymentError', () => {
        it('should have the hidePaymentError being called.', () => {
            component.ErrorMessagePayment = true;
            component.hidePaymentError('error');
            expect(component.ErrorMessagePayment).toEqual(false);
        });
    });
});
