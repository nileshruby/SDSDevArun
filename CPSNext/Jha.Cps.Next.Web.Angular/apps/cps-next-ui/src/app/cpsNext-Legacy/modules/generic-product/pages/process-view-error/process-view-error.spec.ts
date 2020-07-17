import { ProductService, AwardsService } from '@app/services';
import { SessionService } from '@app/services';
import { FormBuilder } from '@angular/forms';
import { ProcessViewErrorPage } from './process-view-error.page';
// import { async } from 'rxjs/internal/scheduler/async';
import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
//import { CommonModule } from '@angular/common';
//import { ReactiveFormsModule, FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder } from '@angular/forms';
//import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA, Component, OnInit } from '@angular/core';
//import { AgGridService, DialogService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, ProductService, AccountService, FiService, AwardsService } from '@app/services';
//import { HttpClientModule } from '@angular/common/http';
//import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
//import { AgGridModule } from 'ag-grid-angular';
//import { AgGridComponent, LocalModalComponent, DatePickerComponent } from '@app/modules/shared/components';
//import { AgCheckboxRenderer, AgActionsRenderer, AgMasterDetailRenderer } from '@app/modules/shared/renderers';
//import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
//import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
//import { MatSlideToggleModule } from '@angular/material/slide-toggle';
//import { MatSelectModule } from '@angular/material/select';
//import * as _ from 'lodash';
//import { UserContext } from '@app/entities/user-context';
//import { TransactionActivityPage } from '..';
//import { PRODUCT_IDS } from '@app/entities/product-ids';
//import { IServiceInstance, IProductActivityRTPSearchResults } from '@app/entities/models';
//import { IApiResponseBackend } from '@app/entities/api-response';
//import * as moment from 'moment';
//import { UrlResolver } from '@app/services/url-reolver';
//import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Params } from '@angular/router';

//const RENDERERS = [
//    AgActionsRenderer,
//    AgCheckboxRenderer,
//    AgMasterDetailRenderer
//  ];

describe('TransactionActivityPage', () => {
    let component: ProcessViewErrorPage;
    let fixture: ComponentFixture<ProcessViewErrorPage>;
    let injector;
    //  = new ProcessViewErrorPage( fp: FormBuilder, 
    //     private awardsService: AwardsService, sessionService: SessionService, productService: ProductService);

    //Setup
    beforeEach(async() => {
        const fakeActivatedRoute = {
            parent: {snapshot: { params: {} } },
            snapshot: { data: { } },
            queryParams: of<Params>({ returnUrl: 'http://test.com', st: true })
          } as ActivatedRoute;
          TestBed.configureTestingModule({
            declarations: [
                ProcessViewErrorPage
            ],
            imports: [
                // CommonModule,
                // ReactiveFormsModule,
                // HttpClientModule,
                // HttpClientTestingModule,
                // // ToastrModule.forRoot(),
                // NgMultiSelectDropDownModule.forRoot(),
                // FormsModule
            ],
            providers: [
                ProductService,
                SessionService,
                AwardsService,
                FormBuilder
            ],
            schemas: [
            ]
            }).compileComponents();
    });

    describe( 'ngOnInit', () => {

        component.prodId = 153; // ProcessView Product
    
        this.component.OnInit();
    
        let data = { FIID: component.prodId, fromDate:null, todate: Date.UTC.toString()};
        component.ngOnInit();

        console.log('FIiDs: ' + component.fiIdLists);
    
        
    
    });

    describe('onSearchFormSubmit', () => {
        it('should return data.', () => {
            
            component.searchForm.setValue({
                serviceId: 1234,
                startDate: "2018-06-01T00:00:00.000Z",
                endDate: "2020-04-05T00:00:00.000Z",
                recordsWorked: null,
                errorFilter: null,
                // bin: new FormControl(''),
                // pan: new FormControl(''),
                fiId: null
            });
            // const spyDisplayToastMsg = spyOn(_toastr, 'error').and.stub();
            const reps = component.onSearchFormSubmit('');
            
             const lngth = expect(reps).length;

            // expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

    });

});

