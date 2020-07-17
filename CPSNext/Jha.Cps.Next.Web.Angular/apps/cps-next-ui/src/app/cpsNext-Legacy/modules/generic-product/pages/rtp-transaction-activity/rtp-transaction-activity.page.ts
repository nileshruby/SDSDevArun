import { CONSTANTS } from './../../../../entities/constants';
import {Component, OnInit, ViewEncapsulation, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import { HelpersService, LoggingService, ProductService, SessionService} from '@app/services';
import { LocalModalComponent} from '@shared/components';
import {IKVP,IProductActivity, IProductActivitySearch, IProductActivitySearchResults, IServiceInstance, IProductActivityRTPSearchResults, ISearchRTPTxnDetailRequest, IRtpTransactionDetailResponse} from '@entities/models';
import * as moment from 'moment';
import * as _ from 'lodash';
import {APP_KEYS} from '@entities/app-keys';
import { UserContext } from '@app/entities/user-context';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LazyLoadEvent, SortEvent } from "primeng/api";

@Component({
  selector: 'rtp-transaction-activity',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './rtp-transaction-activity.html',
  styleUrls: ['./rtp-transaction-activity.scss']
})

export class RTP_TransactionActivityPage implements OnInit, AfterViewInit,OnDestroy {
  protected readonly CLASSNAME = 'RTP_TransactionActivityPage';

  private readonly MAX_TIME_RANGE = 24;
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

 
  @ViewChildren('formattedModal') formattedModalQuery: QueryList<LocalModalComponent>;
  formattedModalSubscription: Subscription;  
  formattedModal: LocalModalComponent;
  
  @ViewChildren('rowDetailModal') rowDetailModalQuery: QueryList<LocalModalComponent>;
  rowDetailModalSubscription: Subscription;  
  rowDetailModal: LocalModalComponent;

  public loading = false;
  public items: IProductActivityRTPSearchResults[] = [];
  public showFileInfo = false;

  public loadingSIDs = false;
  public loadingFIDs = false;
  public svcInstances: IServiceInstance[] = [];
  public fiIds: string[] = [];
  public fiIdLists: string[] = [];
  
  public rtpTransactionDetail: IRtpTransactionDetailResponse;
  public searchForm: FormGroup;
  public lstSearchPar:FormGroup;
  public ResetFilterboxForm:FormGroup;
  public startTimes: IKVP[] = [];
  public endTimes: IKVP[] = [];
  public ModalClose= false;  
  public FilterModalClose= false;  

  public filterText = '';
  public lastSearchParams: IProductActivitySearch = null;

  public formattedValue = '';
  public formattedValues = [];
  dropdownSettings = {};
  dropdownList = [];
  JxTranModModel = false;
  ErrorMessagetootle = false;
  ErrorMessagePayment = false;
  rtpTransactionDetailPayment: any;
  ReverseDebitErrorPopup: boolean = false;
  currentDate = new Date();
  fromDate = this.currentDate.setDate(this.currentDate.getDate()-1);
  toDate = new Date();
  _userDetails: UserContext = this._sessionSvc.get(APP_KEYS.userContext);
  public productCode;
  public aProduct;
  public prodId = 0;
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
    // const userContext = this._sessionSvc.get(APP_KEYS.userContext);
    if (this._userDetails && this._userDetails.assginedProducts) {
      let prod = _.filter(this._userDetails.assginedProducts, (prod) => prod.productCode === this.productCode);
      this.aProduct = prod[0];
      this.prodId = this.aProduct.productId;
    }
  }

  ngOnInit() {
    this.cols = [
      { field: 'RtpTxnID', header: 'Txn ID' },
      { field: 'FIID', header: 'FIID' },
      { field: 'Name', header: 'FI Name' },
      { field: 'CardNumber', header: 'Card Number' },
      { field: 'RequestDateTime', header: 'Request Date / Time' },
      { field: 'Req_Amt', header: 'Payment Amount' },
      { field: 'ResponseDateTime', header: 'Response Date / Time' },
      { field: 'Rsp_TrnRcptId', header: 'Txn Receipt ID' },
      { field: 'Rsp_RsStat', header: 'Response Status' },
      { field: 'Erroneous', header: 'Erroneous' },
      { field: 'ErrorMessage', header: 'Error Message' },
      { field: 'TapTranEligible', header: 'Tap Tran Eligible' },
      { field: 'TapTranIneligibleReason', header: 'Tap Tran Ineligible Reason' }
    ];
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'FIID',
      textField: 'Name',
      allowSearchFilter: true
    };
    this._getServiceIDs();
    this._getFiIds();
    this._buildSearchForm();
  }
  ngAfterViewInit() {
    this.formattedModalSubscription = this.formattedModalQuery.changes.subscribe(
      (formattedQuery: QueryList<LocalModalComponent>) => {
        this.formattedModal = formattedQuery.first;
        this.formattedModalSubscription.unsubscribe();
      }
    );
    this.rowDetailModalSubscription = this.rowDetailModalQuery.changes.subscribe(
      (rowDetailQuery: QueryList<LocalModalComponent>) => {
        this.rowDetailModal = rowDetailQuery.first;
        this.rowDetailModalSubscription.unsubscribe();
      }
    );
  }
  ngOnDestroy() {
    this.formattedModalSubscription.unsubscribe();
    this.rowDetailModalSubscription.unsubscribe();
  }
  public onGridFilter(filterText: string, datatable) {  
    this.filterText = filterText.toUpperCase();
    this._filterSearchResults(datatable);
   }
   public RefreshFilterboxGrid(datatable: any) {
    this.onGridFilter('', datatable);
  }
  
  public onSearchFormSubmit($event: any) { 
    this.lastSearchParams = null;
    this.TransactionList = [];
      this.formattedValue = '';
      this.formattedValues = [];
      this.formattedModal.close();
      this.filterText = '';
      this.items =[];   
    this._searchLogs();
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
      else if(event.field == 'RequestDateTime' || event.field == 'ResponseDateTime' ){
        result = date1 < date2 ? -1 : date1 > date2 ? 1 : 0;
       }
      else {
        result =  result = (value1 < value2 ? -1 : 1)
      }
 
      return result * event.order;
    });
  }
  public onFormReset() {
    if (!this.searchForm)
      return;

    try {
      this.ModalClose = true;
      this.searchForm.controls['serviceId'].setValue('');
      this.searchForm.controls['startDate'].setValue(moment().utc().subtract(1, 'days'));
      this.searchForm.controls['endDate'].setValue(moment().utc());
      this.searchForm.controls['bin'].setValue('');
      this.searchForm.controls['pan'].setValue('');
      this.searchForm.controls['fiId'].setValue('');
      this._defaultSearchLogs();
      this.lastSearchParams = null;
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

    if (type === 'start') {
      this._setEndTimes();
    }
    else if (type === 'end') {
      this._setStartTimes();
    }
  }

  public onFormattedModalCloseClick() {
    this.formattedValue = '';
    this.formattedValues = [];
    this.formattedModal.close(); 
  }

  public onTransactionDetailCloseClick() {
    this.rowDetailModal.close();
  }


  private _onRowSelected = ($event: any) => {

    if (!$event.node.selected)
      return;
    
    if (this.formattedModal.isOpen)
      this.formattedModal.close();
 
    if ($event.data)
      this._showFormattedModal($event.data);
    
  };

  private _getFiIds() {
    this.loadingFIDs = true;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext) 
    if (this._userDetails != null) {
      let userid = this._userDetails.userId;
      this._productSvc.getProductRtpFIs(this.prodId, userid, this._userDetails.isSysAdmin).subscribe(
        response => {
          this.fiIds = response.Data || [];
          this.dropdownList = this.fiIds;
          this.fiIds.forEach((ids: any) => {
            this.fiIdLists.push(ids.FIID);
          });
          this._defaultSearchLogs();
          this.loadingFIDs = false;
        });
    }
  }

  private _getServiceIDs() {
    this.loadingSIDs = true;
    this._productSvc.getServiceIDs(this.prodId).subscribe(
      response => {
        this.svcInstances = response.data || [];

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
    this.ModalClose = false;    
    this.lastSearchParams = _.merge({}, model);
    this.loading = true;
    this.searchRTPTransactionActivity(model);
  }

  private _defaultSearchLogs() {
    let model: IProductActivitySearch = {
      endDate: moment().utc(),
      startDate: moment().utc().subtract(1, 'days'),
      fiId: this.fiIdLists
    };
    this.searchRTPTransactionActivity(model);
  }

  private searchRTPTransactionActivity(model) {
    this._productSvc.searchRTPTransactionActivity(model).subscribe(
      response => {
        if (response.ErrorMessages && response.ErrorMessages.length) {
          response.ErrorMessages.forEach((msg: string) => {
            this._toastr.error(msg);
          });
          return;
        }

        let res: IProductActivityRTPSearchResults[] = response.Data || null;

        if (res && res.length) {
          this.items = res;
          this.items = _.orderBy(this.items, ['RequestDateTime'], ['desc']);
          this.items.forEach((item: IProductActivityRTPSearchResults, i: number) => {
            item.Id = i + 1;

            this._evalRtpTransation(item);
            this._evalRtpDateTime(item, 'RequestDateTime');
            this._evalRtpDateTime(item, 'ResponseDateTime');
          });

          this.filterText = '';
        }
        else
          this.items = [];

        this.TransactionList = this.items;
      },
      () => { },
      () => {
        this.loading = false;
      });
  }

  private _evalRtpTransation(rtpActivity: IProductActivityRTPSearchResults) {
    if (!rtpActivity) return rtpActivity; 

    if (rtpActivity.CreateDateTime) {
      rtpActivity.CreateDateTime = moment(rtpActivity.CreateDateTime)
        .format('MMM DD, YYYY HH:mm:ss');
    }
    return rtpActivity;
  }

  private _evalRtpDateTime(rtpActivity: IProductActivityRTPSearchResults, key) {
    if (!rtpActivity) return rtpActivity;

    if (rtpActivity[key]) {
      rtpActivity[key] = moment(rtpActivity.CreateDateTime)
        .format('MMM DD, YYYY HH:mm:ss');
    }
    return rtpActivity;
  }

  // private _filterSearchResults() {
  
  //   if (this.filterText) {
  //     this.grid.setRowData((this.items.filter((item: IProductActivityRTPSearchResults) => {

  //       if (item.ErrorMessage != null && item.ErrorMessage.toUpperCase().includes(this.filterText.toUpperCase())) {
  //         if (item.ErrorMessage.toUpperCase().indexOf(this.filterText) >= 0) {
  //           return true;
  //         }
  //       }
  
  //       if (item.RtpTxnID != null && item.RtpTxnID.toPrecision() >= this.filterText) {
  //         if (item.RtpTxnID.toPrecision().indexOf(this.filterText) >= 0) {
  //           return true;
  //         }
  //       }

  //       if (item.FIID != null && item.FIID.toPrecision() >= this.filterText) {
  //         if (item.FIID.toPrecision().indexOf(this.filterText) >= 0) {
  //           return true;
  //         }
  //       }
  //       return false;

  //     })),false);
  //   } else {
  //     this.grid.setRowData((this.items),false);
  //   }
  // }

  
  filterTimeout= null;
  private _filterSearchResults(datatable): void {
    if(this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(()=>{
      if (datatable) {
        datatable.filter(this.filterText, 'RtpTxnID', 'contains');
        if (datatable.columns.length == 0) {
          datatable.filter(this.filterText, 'FIID', 'contains');
        }
      }
    },250);
    if (datatable) {
      datatable.filter(this.filterText, 'RtpTxnID', 'contains');
    }
    this.filterText = this.filterText.toUpperCase();
  }

  private _getValidFormModel() {
    if (!this.searchForm)
      return null;

    let valid = true,
      warnings = [];

    let model: IProductActivitySearch = {},
      startDate: moment.Moment,
      endDate: moment.Moment,
      searchDate: moment.Moment


    // SERVICE ID
    // try {
    //   model.serviceId = this.searchForm.controls['serviceId'].value;
    // }
    // catch (err) {
    //   model.serviceId = null;
    // }

    // if (!model.serviceId) {
    //   this._toastr.error('Invalid data,  Please select a valid Service ID.');
    //   return null;
    // }

    // FiId
    let arrayFiIds = this.searchForm.controls['fiId'].value;
    if (arrayFiIds && arrayFiIds.length > 0) {
      model.fiId = [arrayFiIds[0].FIID];
    } else {
      model.fiId = this.fiIdLists;
    }
    // SEARCH DATE
    try {
      startDate = this.searchForm.controls['startDate'].value;
      if (!startDate || !startDate.isValid()) {
        this._toastr.error(CONSTANTS.RTPTransactionActivityMsgs.invalidFromDate);
        return null;
      }
      model.startDate = startDate.utc().set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      });
    }
    catch (err) {
      this._toastr.error(CONSTANTS.RTPTransactionActivityMsgs.invalidDate);
      return null;
    }
    try {
      endDate = this.searchForm.controls['endDate'].value;
      if (!endDate || !endDate.isValid()) {
        this._toastr.error(CONSTANTS.RTPTransactionActivityMsgs.invalidToDate);
        return null;
      }
      model.endDate = endDate.utc().set({
        hour: 23,
        minute: 0,
        second: 0,
        millisecond: 0
      });
    }
    catch (err) {
      this._toastr.error(CONSTANTS.RTPTransactionActivityMsgs.invalidToDatevalue);
      return null;
    }

    if (endDate < startDate) {
      this._toastr.error(CONSTANTS.RTPTransactionActivityMsgs.invalidDateRanges);
      return null;
    }

    // BIN & PAN
    try {
      model.bin = this._helpers.strings.onlyNumbers(this.searchForm.controls['bin'].value, true);
      model.pan = this._helpers.strings.onlyNumbers(this.searchForm.controls['pan'].value, true);
    }
    catch (err) {
      model.bin = null;
      model.pan = null;
    }
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
        //this.startTimes.push(i.toString());
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

  onExpandView(obj) {
    this.rtpTransactionDetailPayment = obj.data;
    let model: ISearchRTPTxnDetailRequest = { RtpTxnID: obj.data.RtpTxnID };
    this._productSvc.searchRTPTransactionActivityDetails(model).subscribe(detailsResponse => {
      if (detailsResponse.ErrorMessages.length) {
        detailsResponse.ErrorMessages.forEach(message => {
          this._toastr.error(message, 'Error!')
        });
      } else {
        
        this.rtpTransactionDetail = detailsResponse.Data;
        this.rowDetailModal.open();
      }
    });
    
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
        //this.endTimes.push(i.toString());
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
      //this.endTimes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
    }
  }

  private _buildSearchForm() {
    this.searchForm = this._fb.group({
      serviceId: new FormControl(''),
      startDate: new FormControl(moment().utc().subtract(1, 'days')),
      endDate: new FormControl(moment().utc()),
      bin: new FormControl(''),
      pan: new FormControl(''),
      fiId: new FormControl('')
    });

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
  }
  if (!this.ModalClose )
  {
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
  public changeDate(date) {
     return moment(date)
        .format('MMM DD, YYYY HH:mm:ss');    
  }
  public JxTranModPopup() {
    // this.JxTranModModel = true;

  }
  public JxTranModPopupOut(){
    // if (this.JxTranModModel) {
    //   this.JxTranModModel = false;
    // } else {
    //   this.JxTranModModel = true;
    // }
  }
  public showError(value) {
    if (value) {
      this.ErrorMessagetootle = true;
    }
  }
  public hideError(value) {
    if (value) {
      if (this.ErrorMessagetootle) {
        this.ErrorMessagetootle = false;
      } else {
        this.ErrorMessagetootle = true;
      }
    }
  }
  public showReverseDebitErrorPopup() {
    this.ReverseDebitErrorPopup = true;

  }
  public hideReverseDebitErrorPopup(){
    if (this.ReverseDebitErrorPopup) {
      this.ReverseDebitErrorPopup = false;
    } else {
      this.ReverseDebitErrorPopup = true;
    }
  }
  public showPaymentError(value) {
    if (value) {
      this.ErrorMessagePayment = true;
    }
  }
  public hidePaymentError(value) {
    if (value) {
      if (this.ErrorMessagePayment) {
        this.ErrorMessagePayment = false;
      } else {
        this.ErrorMessagePayment = true;
      }
    }
  }

}
