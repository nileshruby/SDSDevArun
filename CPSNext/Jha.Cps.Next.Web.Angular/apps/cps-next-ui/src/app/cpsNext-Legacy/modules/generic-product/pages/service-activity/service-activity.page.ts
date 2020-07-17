import { CONSTANTS } from '@app/entities/constants';
import { Component, OnInit,  ViewEncapsulation, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

import {ToastrService} from 'ngx-toastr';

import {HelpersService, LoggingService, ProductService, SessionService} from '@app/services';
import {LocalModalComponent} from '@shared/components';
import {IKVP, IProductActivity, IProductActivitySearch, IProductActivitySearchResults, IServiceInstance} from '@entities/models';

import * as moment from 'moment';
import * as _ from 'lodash';
import { UserContext } from '@app/entities/user-context';
import { ActivatedRoute } from '@angular/router';
import { APP_KEYS } from '@app/entities/app-keys';
import { Subscription } from 'rxjs';
import { LazyLoadEvent, SortEvent } from "primeng/api";

@Component({
  selector: 'service-activity',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './service-activity.html',
  styleUrls: ['./service-activity.scss']
})

export class ServiceActivityPage implements OnInit, AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = 'ServiceActivityPage';

  private readonly MAX_DATE_RANGE = 7;
  private readonly MAX_TIME_RANGE = 4;
  private readonly DAY_HOURS = [
    '12:00 am',
    '1:00 am',
    '2:00 am',
    '3:00 am',
    '4:00 am',
    '5:00 am',
    '6:00 am',
    '7:00 am',
    '8:00 am',
    '9:00 am',
    '10:00 am',
    '11:00 am',
    '12:00 pm',
    '1:00 pm',
    '2:00 pm',
    '3:00 pm',
    '4:00 pm',
    '5:00 pm',
    '6:00 pm',
    '7:00 pm',
    '8:00 pm',
    '9:00 pm',
    '10:00 pm',
    '11:00 pm'
  ];

  @ViewChildren('datatable') dataTableQuery: QueryList<ElementRef>;
  dataTableSubscription: Subscription;
  datatable: ElementRef;

  @ViewChildren("formattedModal") formattedModalQuery: QueryList<LocalModalComponent>;
  formattedModalSubscription: Subscription;  
  formattedModal: LocalModalComponent;
  
  public loading = false;
  public items: IProductActivity[] = [];
  public showFileInfo = false;

  public loadingSIDs = false;
  public svcInstances: IServiceInstance[] = [];

  public searchForm: FormGroup;
  public ResetFilterboxForm:FormGroup;
  public lstSearchPar:FormGroup;
  public startTimes: IKVP[] = [];
  public endTimes: IKVP[] = [];
  public searchType = 0;

  public filterText = '';
  public ModalClose= false;  
  public FilterModalClose= false; 
  public lastSearchParams: IProductActivitySearch = null;
  public productCode;
  public aProduct;
  public prodId = 0;
  public _userDetails: UserContext = null;
  public formattedValue = '';
  public formattedValues = [];
  dropdownSettings = {};
  dropdownList = [];
  cols: any[]=[];
  TransactionList:any = [];
  constructor(private _fb: FormBuilder,
              private _productSvc: ProductService,
              private _toastr: ToastrService,
              private _helpers: HelpersService,
              private _sessionSvc: SessionService,
              private rout: ActivatedRoute,
              private _log: LoggingService) {
    this.productCode = this.rout.parent.snapshot.params.param;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (this._userDetails && this._userDetails.assginedProducts) {
      let prod = _.filter(this._userDetails.assginedProducts, (prod) => prod.productCode === this.productCode);
      this.aProduct = prod[0];
      this.prodId = this.aProduct.productId;
    }
  }

  ngOnInit() {
    this.cols = [
      { field: 'id', header: '#' },
      { field: 'text', header: 'Log' },
      { field: 'timeStamp', header: 'Time Stamp' },
      { field: 'fileName', header: 'FileName' },
    ];
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'sviID',
      textField: 'serviceId',
      allowSearchFilter: true
    };
    this._getServiceIDs();
    this._buildSearchForm();

    // TIME RANGE TEST
    // this._searchLogs({
    //   serviceId: 'PSCUDXSVC_01',
    //   startDate: moment('2018/08/20').utc().set({
    //     hour: 3,
    //     minute: 0,
    //     second: 0,
    //     millisecond: 0
    //   }),
    //   endDate: moment('2018/08/20').utc().set({
    //     hour: 7,
    //     minute: 0,
    //     second: 0,
    //     millisecond: 0
    //   }),
    //   bin: '403404'
    // });
  }
  ngAfterViewInit() {
    this.dataTableSubscription = this.dataTableQuery.changes.subscribe(
      (dataQuery: QueryList<ElementRef>) => {
        this.datatable = dataQuery.first;
        this.dataTableSubscription.unsubscribe();
      }
    );

    this.formattedModalSubscription = this.formattedModalQuery.changes.subscribe(
      (ql: QueryList<LocalModalComponent>) => {
        this.formattedModal = ql.first;
        this.formattedModalSubscription.unsubscribe();
      }
    );
    
  }

  ngOnDestroy() {
    this.dataTableSubscription.unsubscribe();
    this.formattedModalSubscription.unsubscribe();
  }
  public onGridFilter(filterText: string, datatable) {  
    this.filterText = filterText.toUpperCase();
    this._filterSearchResults(datatable);
   }
   public RefreshFilterboxGrid(datatable: any) {
    this.onGridFilter('', datatable);
  }

  public onSearchFormSubmit($event: any) {
    this.ModalClose = true;

    this.lastSearchParams = null;
    this.onGridFilter('', this.datatable);
    this.TransactionList = [];  
    this.formattedValue = '';
    this.formattedValues = [];
    this.formattedModal.close();
    this.filterText = '';
    this.items =[]; 
    this._searchLogs();
  }

  public onFormReset() {
    if (!this.searchForm)
      return;

    try {
      this.ModalClose = true;
      this.searchForm.controls['serviceId'].setValue('');
      this.searchForm.controls['startDate'].setValue(moment());
      this.searchForm.controls['startTime'].setValue('');
      this.searchForm.controls['endTime'].setValue('');
      // this.searchForm.controls['bin'].setValue('');
      // this.searchForm.controls['pan'].setValue('');

      this._setStartTimes();
      this._setEndTimes();

      this.lastSearchParams = null;
      this.onGridFilter('', this.datatable);
    this.TransactionList = [];
      this.formattedValue = '';
      this.formattedValues = [];
      this.formattedModal.close();
      this.filterText = '';
      this.items =[];
      
    }
    catch (err) {
    }
  }

  public onDateChange(type: string) {
    if (type === 'start') {
    }
    else if (type === 'end') {
    }
  }

  public onTimeChange(type: string) {
    this._log.debug(`${this.CLASSNAME} > onTimeChange() > type: ${type}`);
    this.ModalClose = true;
    this.items =[]; 
    if (type === 'start') {
      this._setEndTimes();
    }
    else if (type === 'end') {
      this._setStartTimes();
    }
  }
// public onBinChange(type: string){
//   this.ModalClose = true;
//   this.items =[]; 
// }

// public onPanChange(type: string){
//   this.ModalClose = true;
//   this.items =[]; 
// }
  public onFormattedModalCloseClick() {
    this.formattedValue = '';
    this.formattedValues = [];
    this.searchType = 0;
    this.formattedModal.close();
  }


  private _onRowSelected = ($event: any) => {
    // this._log.debug(`${this.CLASSNAME} > _onRowSelected() > $event`, $event);

    // if (!$event.node.selected)
    //   return;

    if (this.formattedModal.isOpen)
      this.formattedModal.close();

    if ($event.data)
      this._showFormattedModal($event.data);
  };

  private _getServiceIDs() {
    this.loadingSIDs = true;
    this._productSvc.getServiceIDs(this.prodId).subscribe(
      response => {
        // this._log.debug(`${this.CLASSNAME} > _productSvc.getServiceIDs() > response.data: `, response.data);
        this.svcInstances = response.data || [];
        this.dropdownList = this.svcInstances;
        this.loadingSIDs = false;
      },
      () => {
        this.loadingSIDs = false;
      });
  }

  private _searchLogs(model?: IProductActivitySearch) {
    if (!model)
      model = this._getValidFormModel();

    if (!model)
      return;

    this._log.debug(`${this.CLASSNAME} > _searchLogs() > model: `, model);
    if(this.searchForm.controls['serviceId'].valueChanges || this.searchForm.controls['startTime'].valueChanges || this.searchForm.controls['endTime'].valueChanges)  
    {
      this.ModalClose = false; 
    }
    this.lastSearchParams = _.merge({}, model);
    this.loading = true;
    
    //mock up data for testing
    // this.TransactionList =    this._productSvc.getactivityList();
    //  if(this.TransactionList.length > 0 )
    //  {
    //  this.loading = true; 
    //  } 
    //mock up data
    this._productSvc.searchServiceActivity(model).subscribe(     
      response => {
        if (response.errorMessages && response.errorMessages.length) {
          response.errorMessages.forEach((msg: string) => {
            this._toastr.error(msg);
          });
          return;
        }

        let res: IProductActivitySearchResults = response.data || null;

        if (res && res.items && res.items.length) {
          this.items = res.items;

          this.items.forEach((item: IProductActivity, i: number) => {
            item.id = i + 1;
          });

          this.filterText = '';
        }
        else
          this.items = [];

        this.TransactionList = this.items;
      },
      () => {
      },
      () => {
        this.loading = false;
      });
  }

  // private _filterSearchResults() {
  //   if (this.filterText) {
  //     this.grid.setRowData((this.items.filter((item: IProductActivity) => {
  //       return item.text.toUpperCase().indexOf(this.filterText) >= 0;
  //     })),false);
  //   }
  //   else
  //     this.grid.setRowData(this.items,false);
  // }

  filterTimeout= null;
  private _filterSearchResults(datatable): void {
    if(this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(()=>{
        if (datatable) {
        datatable.filterGlobal(this.filterText,'contains')
      }
    },250);
    if (datatable) {
      datatable.filterGlobal(this.filterText,  'contains')
    }
    this.filterText = this.filterText.toUpperCase();
  }
  // Validates form and returns a valid model, or null.
  private _getValidFormModel() {
    if (!this.searchForm)
      return null;

    let valid = true,
      warnings = [];

    let model: IProductActivitySearch = {};

    // SERVICE ID
    try {
      let serviceId = this.searchForm.controls['serviceId'].value;
      if (serviceId && typeof serviceId === 'object' && serviceId.length > 0) {
        model.serviceId = serviceId[0].sviID;
        model.ServiceName = serviceId[0].serviceId;
      }
    }
    catch (err) {
      model.serviceId = null;
    }

    if (!model.serviceId) {
      this._toastr.error(CONSTANTS.cardMaintServiceActivityMsgs.invalidServiceID);
      return null;
    }
    
    try {
      let startDate: moment.Moment = this.searchForm.controls['startDate'].value;
      let startTime = parseInt(this.searchForm.controls['startTime'].value);
      let endTime = parseInt(this.searchForm.controls['endTime'].value);

      if (!startDate) {
        this._toastr.error(CONSTANTS.cardMaintServiceActivityMsgs.invalidSearchDate);
        return null;
      }

      if (isNaN(startTime) || startTime < 0) {
        this._toastr.error(CONSTANTS.cardMaintServiceActivityMsgs.invalidStartTime);
        return null;
      }

      if (isNaN(endTime) || endTime > 24) {
        this._toastr.error(CONSTANTS.cardMaintServiceActivityMsgs.invalidEndTime);
        return null;
      }

      if ((endTime - startTime) > this.MAX_TIME_RANGE) {
        this._toastr.error(`Start Time and End Time can only be ${this.MAX_TIME_RANGE} hours apart.`);
        return null;
      }

      startDate.utc().set({
        minute: 0,
        second: 0,
        millisecond: 0
      });
      model.startDate = startDate.clone().set('hour', startTime);
      model.endDate = startDate.clone().set('hour', endTime === 24 ? 0 : endTime);
    }
    catch (err) {
      model.endDate = null;
      model.endDate = null;
    }

    
    // BIN & PAN
    // if(this.searchForm.controls['bin'].value ||this.searchForm.controls['pan'].value)
    // {
    // try {
    //   model.bin = this._helpers.strings.onlyNumbers(this.searchForm.controls['bin'].value, true);
    //   model.pan = this._helpers.strings.onlyNumbers(this.searchForm.controls['pan'].value, true);
    // }
    // catch (err) {
    //   model.bin = null;
    //   model.pan = null;
    // }
    // }
    // else{
    // model.bin = '';
    // model.pan = '';
    // }
    return model;
  }


  private _setStartTimes() {
    this.startTimes = [];

    let endTime;

    try {
      endTime = parseInt(this.searchForm.controls['endTime'].value);
    }
    catch (err) {
      endTime = null;
    }

    if (endTime) {
      for (let i = Math.max(0, endTime - this.MAX_TIME_RANGE); i < endTime; i++) {
        this.startTimes.push(<IKVP>{
          key: i.toString(),
          value: this.DAY_HOURS[i]
        });
      }
    }
    else {
      this.startTimes = this.DAY_HOURS
        .map((time: string, i: number) => {
          return <IKVP>{
            key: i.toString(),
            value: time
          };
        })
        .filter((kvp: IKVP) => {
          return kvp.key < 24;
        });
      // this.startTimes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    }
  }

  private _setEndTimes() {
    this.endTimes = [];

    let startTime;

    try {
      startTime = parseInt(this.searchForm.controls['startTime'].value);
    }
    catch (err) {
      startTime = null;
    }

    if (!isNaN(startTime)) {
      for (let i = startTime + 1; i <= Math.min(24, startTime + this.MAX_TIME_RANGE); i++) {
        this.endTimes.push(<IKVP>{
          key: i.toString(),
          value: this.DAY_HOURS[i]
        });
      }
    }
    else {
      this.endTimes = this.DAY_HOURS
        .map((time: string, i: number) => {
          return <IKVP>{
            key: i.toString(),
            value: time
          };
        })
        .filter((kvp: IKVP) => {
          return kvp.key > 0;
        });
      // this.endTimes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
    }
  }
  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let date1 = new Date(value1);
      let value2 = data2[event.field];
      let date2 = new Date(value2);
      let result = null;
      let test1 = new Date(value1);
 
      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } 
      else if(event.field == 'timeStamp' ){
        result = date1 < date2 ? -1 : date1 > date2 ? 1 : 0;
       }
      else {
        result =  result = (value1 < value2 ? -1 : 1)
      }
 
      return result * event.order;
    });
  }
  private _buildSearchForm() {
    this.searchForm = this._fb.group({
      serviceId: new FormControl(''),
      startDate: new FormControl(moment()),
      endDate: new FormControl(moment()),
      startTime: new FormControl(''),
      endTime: new FormControl('')
      // bin: new FormControl(''),
      // pan: new FormControl('')
    });

    this._setStartTimes();
    this._setEndTimes();
  }

  private _showFormattedModal(activity: IProductActivity) {
    this._log.debug(`${this.CLASSNAME} > _showFormattedModal() > activity`, activity);
    if (!activity || !activity.id)
      return;

    this.formattedValue = '';
    this.formattedValues = [];

    // PSCUDX -- ISO_MSG: [0382] - [053500].  <INBOUND_REQUEST><DE_MTI>0382</DE_MTI><DE_000>8220000000000000</DE_000><DE_001>0000002108008010</DE_001><DE_007>0820030937</DE_007><DE_011>053500</DE_011><DE_091>2</DE_091><DE_096>12345   </DE_096><DE_101>CH02</DE_101><DE_113>842500933</DE_113><DE_124>438960******8277        00****            2207N*****  </DE_124><DE_124.0>CH02</DE_124.0><DE_124.1>438960******8277   </DE_124.1><DE_124.2>     </DE_124.2><DE_124.3>00</DE_124.3><DE_124.4>****            </DE_124.4><DE_124.5>2207</DE_124.5><DE_124.6>N</DE_124.6><DE_124.7>****</DE_124.7><DE_124.8>*</DE_124.8><DE_124.9> </DE_124.9><DE_124.10> </DE_124.10><CORRELATION_ID>053500</CORRELATION_ID><TXNTYPE>APFILEUPDATE</TXNTYPE><HSM_PINVERIFY>1</HSM_PINVERIFY><PIN_CODE>1111</PIN_CODE><META_SWITCHID>1</META_SWITCHID><SWITCH_CODE /><MESSAGE_SPEC>FIS</MESSAGE_SPEC><MESSAGE_SECURITY_CODE>12345   </MESSAGE_SECURITY_CODE><WCF_CLIENT_ID>1</WCF_CLIENT_ID><META_CREATION_PORTID>APMNT01_5200</META_CREATION_PORTID><META_TRACEID>bd6338f4-8ffb-49f4-920e-96806d9b0c9a</META_TRACEID><META_CREATION_UTCDT>2018-08-20T08:09:37.2435442Z</META_CREATION_UTCDT></INBOUND_REQUEST>  Received the request message from the ISO channel."
    if (this.ModalClose )
    {
      //  console.log("going to exitloop" );
    }
    if (!this.ModalClose )
    {
      this.searchType = 1;
    if (activity.text.indexOf('<') >= 0) {
      const OPEN = '<',
        CLOSE = '>',
        TERM = '</';

      let val = activity.text,
        nodeVal = '',
        start = val.indexOf(OPEN),
        end = val.indexOf(CLOSE, start),
        termStart = 0,
        termEnd = 0;

      this.formattedValues.push(val.slice(0, start));

      while (start >= 0) {
        if (val.substr(start, 2) === TERM) {
          this.formattedValues.push(val.slice(start, end + 1));
        }
        else {
          nodeVal = val.slice(start + 1, end);
          termStart = val.indexOf(TERM, end);
          termEnd = val.indexOf(CLOSE, termStart);

          if (val.slice(termStart + 2, termEnd) === nodeVal) {
            this.formattedValues.push(val.slice(start, termEnd + 1));
            end = termEnd;
          }
          else
            this.formattedValues.push(val.slice(start, end + 1));
        }

        start = val.indexOf(OPEN, end);

        if (start >= 0)
          end = val.indexOf(CLOSE, start);
      }

      if ((end + 1) < val.length)
        this.formattedValues.push(val.slice(end + 1, val.length));
    }
    else {
      this.formattedValue = activity.text;
    }

    this.formattedModal.open();
  }
  }
}
