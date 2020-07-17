import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { AccountService } from "@app/services";
//import { genericCRUDMsgs } from './../../../../entities/constants';
import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import * as _ from "lodash";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
// import { AwardsService} from '@services/awards.svc';
import { SessionService, ProductService, AwardsService } from "@app/services";
import { IAwardsErrorType, FiContext } from "@entities/models";
import { UserContext } from "@entities/user-context";
import { APP_KEYS } from "@entities/app-keys";
import * as moment from "moment";
import { PRODUCT_IDS } from "@app/entities/product-ids";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
// import {TableCheckbox } from 'primeng/table';
import { LocalModalComponent } from "@shared/components";

@Component({
  selector: "process-view-error",
  templateUrl: "./process-view-error.html",
  styleUrls: ["./process-view-error.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ProcessViewErrorPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("datatable", { static: true }) ddTable: ElementRef;
  @ViewChild("startDate", { static: true }) ddStartDate: ElementRef;
  @ViewChild("endDate", { static: true }) ddEndDate: ElementRef;

  //@ViewChildren("eaModal") mrfModalQuery: QueryList<LocalModalComponent>;
  @ViewChildren("rowDetailModal") rowDetailModalQuery: QueryList<LocalModalComponent>;
  //mrfModalQuerySubscription: Subscription;
  //eaModal: LocalModalComponent;
  rowDetailModalQuerySubscription: Subscription;
  rowDetailModal: LocalModalComponent;

  fromDefaultDateClicked = false;
  toDefaultDateClicked = false;

  @ViewChildren('bruModal') bruModalQuery: QueryList<LocalModalComponent>;
  bruModalSubscription: Subscription;
  bruModal: LocalModalComponent;

  @ViewChildren('mrfModal') mrfModalQuery: QueryList<LocalModalComponent>;
  mrfModalSubscription: Subscription;
  mrfModal: LocalModalComponent;

  public isStartDate: any;
  public isEndDate: any;
  public isDomTable: any;
  public Heading = "";
  public searchForm: FormGroup;
  SearchForm: FormGroup;
  public loading = false;
  expandedRows: any[] = [];
  cols: any[] = [];
  public prodId = 153;
  // public prodId = PRODUCT_IDS.QR;
  public fiIds: any[] = [];
  public fiIdLists: any[] = [];
  public userFIID = "";
  dropdownList = [];
  dropdownListFI = [];
  dropdownSettings = {};
  FidropdownSettings = {};

  fileTypeList = [];
  fileTypedropdownSettings = {};

  filterTimeout = null;

  public loadingFIDs = false;
  public _userDetails: UserContext = null;
  public recordsWorked = false;
  public FIUsers = false;
  public ResetForm = false;
  FiSelect: any = [];
  public fiList: FiContext[] = [];
  public fromDate: any;
  public toDate: any;

  public errorList: any[] = [];
  errorOpts: IAwardsErrorType[] = [];
  public fileType: any;
  public bruFile: any;
  public mrfFile: any;
  //public mrfForm: FormGroup;
  //public mrfEditing: EAContext = null;

  //Search Data
  public startDate = moment().subtract(1, "days"); //moment().utc().subtract(1, 'days').format('DD-MMM-YYYY');
  public endDate = moment(new Date()); // moment().utc().subtract(0, 'days').format('DD-MMM-YYYY');
  //End Search Data
  selectedItems = [];
  EXPORTED_COLUMNS = [
    "MainframeFIID",
    "ResponseFileName",
    "BruFileDate",
    "BruFileSequence",
    "BruRecordType",
    "BruCardNumberMasked",
    "ChName",
    "ChAddress1",
    "ChCity",
    "FiAccountNumber",
    "BruRewardUpdateType",
    "ResponseErrorCode",
    "ResponseErrorDescription",
  ];
  customfilterFields = ['ResponseErrorCode', 'ResponseErrorDescription', 'MainframeFIID', 'BruCardNumberMasked', 'ChName'];

  @ViewChildren("datatable") dataTableQuery: QueryList<ElementRef>;
  dataTableSubscription: Subscription;
  datatable: ElementRef;

  constructor(
    private _fb: FormBuilder,
    private awardsService: AwardsService,
    private _sessionSvc: SessionService,
    private _productSvc: ProductService,
    private _accountSvc: AccountService,
    private _toastr: ToastrService,
    private rout: ActivatedRoute
  ) {
    const p = this.rout.parent.snapshot.params.param;
    const prd = this.rout.parent.snapshot.params.param;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (this._userDetails && this._userDetails.assginedProducts) {
      let prod = _.filter(
        this._userDetails.assginedProducts,
        (prod) => prod.productCode === prd
      );
      const aProduct = prod[0];
      this.prodId = aProduct.productId;
      this.Heading = aProduct.productName;
    }
  }

  ngAfterViewInit() {
    // this.isDomTable = this.ddTable;
    this.isStartDate = this.ddStartDate;
    // this.ddStartDate.nativeElement.clearValue();
    this.isEndDate = this.ddEndDate;
    this.onSearch("", this.ddTable);
    // this.onSearch('',this.isDomTable);
    this.searchForm.controls["startDate"].setValue(this.startDate);
    this.searchForm.controls["endDate"].setValue(this.endDate);

    this.bruModalSubscription = this.bruModalQuery.changes.subscribe(
      (bruQuery: QueryList<LocalModalComponent>) => {
        this.bruModal = bruQuery.first;
        this.bruModalSubscription.unsubscribe();
      });

    this.mrfModalSubscription = this.mrfModalQuery.changes.subscribe(
      (mrfQuery: QueryList<LocalModalComponent>) => {
        this.mrfModal = mrfQuery.first;
        this.mrfModalSubscription.unsubscribe();
      });


    this.rowDetailModalQuerySubscription = this.rowDetailModalQuery.changes.subscribe(
      (rowDetailQuery: QueryList<LocalModalComponent>) => {
        this.rowDetailModal = rowDetailQuery.first;
        this.rowDetailModalQuerySubscription.unsubscribe();
      });
  }

  ngOnInit() {
    this.selectedItems = [];
    this.startDate = moment().subtract(1, "days");
    this.endDate = moment().subtract(0, "days");

    this.fromDefaultDateClicked = false;
    this.toDefaultDateClicked = false;

    this.dropdownSettings = {
      singleSelection: false,
      idField: "FIID",
      textField: "Name",
      allowSearchFilter: true,
      selectAllText: "Select All",
      //itemsShowLimit: 1,
    };

    this.fileTypedropdownSettings = {
      singleSelection: true,
      idField: "errorID",
      textField: "Name",
      allowSearchFilter: true,
      selectAllText: "Select All",
      itemsShowLimit: 1,
    };
    this.FidropdownSettings = {
      singleSelection: false,
      idField: "FIID",
      textField: "Name",
      allowSearchFilter: true,
    };
    this.errorList = [];
    this.SearchForm = this._fb.group({});

    this._buildSearchForm();

    const choices = this.awardsService.getErrorTypes().subscribe((resp) => {
      // console.log(resp);
      this.errorOpts = resp.data;
      this.errorOpts.forEach((element) => {
        this.fileTypeList.push(element.value);
      });

      this.onOptionSelected(this.errorOpts[0]);
    });

    // console.log('Choices: ' + JSON.stringify(choices.data));
    this._getFiIds();
    this.getuserdetails();
    this.onSearch("", this.ddTable);
  }

  public onrefreshsubmit() {
    this.RefreshFilterboxGrid(" ");
  }
  public RefreshFilterboxGrid(dataTable: any) {
    this.onSearch("", dataTable);
  }

  ngOnDestroy() {
    //this.mrfModalQuerySubscription.unsubscribe();
    this.rowDetailModalQuerySubscription.unsubscribe();
  }

  public onDateTouched(env, src) {
    console.log("touched" + env.name);
    if (src === "From") this.fromDefaultDateClicked = true;
    if (src === "To") this.toDefaultDateClicked = true;
  }

  onExportClick(datatable: any) {
    const options: any = {
      fileName: "Awards",
      sheetName: "awards",
      exportData: this.EXPORTED_COLUMNS,
    };

    if (datatable) this.export(datatable, options);
  }
  public export(e: any, options: any) {
    e.exportCSV(options);
  }

  public onSearch(searchText: string, datatable: any): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(() => {
      if (datatable) {
        datatable.filterGlobal(searchText, "contains");
      }
    }, 250);
    if (datatable) {
      datatable.filterGlobal(searchText, "contains");
    }
  }

  public onSearchFormSubmit($event: any) {
    if (!this.isValidDateRange()) {
      return;
    }
    try {
      const fis = this.searchForm.controls["fiId"].value;
      const startDate: moment.Moment = this.searchForm.controls["startDate"]
        .value;
      const endDate: moment.Moment = this.searchForm.controls["endDate"].value;
      const recordsWorked = this.searchForm.controls["recordsWorked"].value;
      const errorFilter = this.searchForm.controls["errorFilter"].value;
      if (errorFilter === null || errorFilter.length === 0) {
        this._toastr.error("Invalid data. File Type is required");
        return;
      }
      if (!this.isValidDateRange()) {
        return;
      }
      const fileTypeID = this.getFileTypeID(errorFilter);
      this.onOptionSelected(fileTypeID);
    } catch { }
  }

  private getFileTypeID(name): string {
    let id = null;

    const v = this.errorOpts.find((x) => x.value == name);
    if (v) id = v.ID;
    return id;
  }

  private isValidDateRange(): boolean {
    // let from: moment.Moment = this.searchForm.controls['startDate'].value;
    // let to: moment.Moment = this.searchForm.controls['endDate'].value;

    let from = moment(this.searchForm.controls["startDate"].value).format(
      "DD-MMM-YYYY"
    );
    let to = moment(this.searchForm.controls["endDate"].value).format(
      "DD-MMM-YYYY"
    );

    const _now = moment(new Date(), "days");
    if (this.fromDefaultDateClicked && from === null) {
      this.searchForm.controls["startDate"].setValue(_now);
      from = moment(this.searchForm.controls["startDate"].value).format(
        "DD-MMM-YYYY"
      );
      // from = _now;
    }
    if (this.toDefaultDateClicked && to === null) {
      this.searchForm.controls["endDate"].setValue(_now);
      to = moment(this.searchForm.controls["endDate"].value).format(
        "DD-MMM-YYYY"
      );
      // to = _now;
    }

    //Missing From Date
    if (from === null && to !== null) {
      this._toastr.error(
        "Invalid data; From Date must be provided when To date is present!"
      );
      return false;
    }

    //Missing To Date
    if (to === null && from !== null) {
      this._toastr.error(
        "Invalid data; To must be provided when From date is present!"
      );
      return false;
    }

    const fromUntouched =
      this.searchForm.controls["startDate"].untouched || from === null;
    const toUntouched =
      this.searchForm.controls["endDate"].untouched || to === null;

    // Both dates null
    if (fromUntouched && toUntouched) {
      //No error message
      return true;
    }
    //From Date  greater than to date
    else if (new Date(from) > new Date(to)) {
      this._toastr.error(
        "Invalid data; From Date cannot be greater than To Date!"
      );
      return false;
    }
    // From date selected but no to date selected
    else if (fromUntouched && to == null) {
      this._toastr.error(
        "Invalid data; To Date must be selected when selecting a From Date!"
      );
      return false;
    }
    //From date is null and todate is < today's date
    else if (
      fromUntouched &&
      new Date(to) < new Date(_now.format("DD-MMM-YYYY"))
    ) {
      this._toastr.error(
        "Invalid data; To Date cannot be less than From Date!"
      );
      return false;
    } else if (toUntouched && new Date(from) > new Date(to)) {
      this._toastr.error(
        "Invalid data; To Date cannot be less than From Date!"
      );
      return false;
    }
    //From is set and to is not set
    else if (!fromUntouched && toUntouched) {
      this.searchForm.controls["endDate"].setValue(moment(new Date()));
      return false;
    }

    // if (fromUntouched  toDate is before CurrentDate)
    //    errorMessage =" Invalid date. To date cannot be before From date"

    // if(toUntouched and )

    // if(from==null && to!=null) {
    //   this._toastr.warning('Invalid data; missing From Date!');
    //     return false;
    // }

    // if(from!=null && to==null) {
    //   this._toastr.warning('Invalid data; missing To Date!');
    //     return false;
    // }

    // if((from==null && to==null) || (to == null ||  from<=to))
    //     return true;
    // else
    // {
    //   this._toastr.warning('From Date must be before To Date!');
    //     return false;
    // }
    return true;
  }

  FiletypeSelected() {
    // this.ResetForm = false;
  }
  onFormReset() {
    //Clear this form search value
    this.startDate = moment(new Date()).subtract(1, "days");
    this.endDate = moment(new Date());
    this.searchForm.controls["startDate"].setValue(this.startDate);
    this.searchForm.controls["endDate"].setValue(this.endDate);
    this.fromDefaultDateClicked = true;
    this.toDefaultDateClicked = true;
    //  this.ddStartDate.nativeElement.clearValue();
    //  this.isStartDate.displayValue='';
    //  this.isStartDate.clearDisplay();
    //  this.isEndDate.setDisplayValue();
    if (this.FIUsers === false) {
      // this.FISelectedDeAll([]);
      this.searchForm.controls["fiId"].setValue([]);
      //this.searchForm.controls['fiId'].setValue(['select',''])
    }
    this.searchForm.controls["errorFilter"].setValue([]);
    this.errorList = [];
    this.ResetForm = true;
  }

  FISelectedDeAll(SelectedFI) {
    this.fiIds = [];
    this.fiIdLists = [];
    this.FiSelect = [];
    this._getFiIds();
  }

  // onPageChange($event: any,dataTable:any){
  //   this.onSearch('',dataTable)
  // }

  onOptionSelected(errorType: any, datatable: any = null) {
    // console.log('Error type selected: ' + errorType);
    if (errorType == "" || errorType == null) {
      errorType = "BRU";
    }
    this.awardsService.getColumns(errorType).subscribe((res) => {
      this.cols = res.data;
    });

    this.fileType = errorType;

    if (
      this.searchForm.get("startDate").value == null ||
      this.searchForm.get("startDate").value == ""
    ) {
      //new Date();
      if (
        this.fromDate == null ||
        this.fromDate === "undefined" ||
        this.fromDate === ""
      ) {
        this.fromDate = this.searchForm.controls["startDate"].value;
      } else {
        this.fromDate = this.fromDate;
      }
    } else {
      this.fromDate = this.searchForm.get("startDate").value;
    }
    if (
      this.searchForm.get("endDate").value == null ||
      this.searchForm.get("endDate").value === ""
    ) {
      if (
        this.toDate == null ||
        this.toDate === "undefined" ||
        this.toDate === ""
      ) {
        this.toDate = this.searchForm.get("endDate").value;
      } else {
        this.toDate = this.toDate;
      }
      // this.toDate = this.toDate; //new Date();
    } else {
      this.toDate = this.searchForm.get("endDate").value;
    }

    const from = this.fromDate;
    const to = this.toDate;
    this.errorList = [];

    const fis = this.searchForm.get("fiId").value;

    const mainframeFIIDS: string[] = [];

    if (fis) {
      const v = this.fiIds.filter((el) => {
        return fis.some((el2) => {
          return el2.FIID === el.FIID;
        });
      });

      // const t = v.join(',');
      v.forEach((item) => {
        mainframeFIIDS.push(item.MainframeFIID);
      });
    }
    const mainframeIds = mainframeFIIDS.join(",");
    //this.fiIds.filter( mfIds => mfIds.indexOf(f))
    if (errorType === "BRU") {
      this.customfilterFields = ['ResponseErrorCode', 'ResponseErrorDescription', 'MainframeFIID', 'BruCardNumberMasked', 'ChName'];

      this.awardsService
        .getBRUFileType(errorType, mainframeIds, from, to)
        .subscribe((response) => {
          if (response.Data) {
            response.Data.forEach((element) => {
              const element2 = element;
              if (element2.BruFileDate) {
                if (element2.BruFileDate == null) {
                  element2.BruFileDate = "";
                } else {
                  element2.BruFileDate = moment(element2.BruFileDate).format(
                    "MM-DD-YYYY"
                  );
                }
              }
              if (element2.BruFileSequence == null) {
                element2.BruFileDate = "";
              }
              element2.ResponseErrorCode =
                element.ResponseErrorCode +
                "-" +
                element.ResponseErrorDescription;
              this.errorList.push(element2);
            });
            this.errorList = response.Data;
            this.onSearch("", this.ddTable);
            // this.errorList = response.Data;
          }
        });
    }
    else if (errorType === "MRF") {
      this.customfilterFields = ['ResponseErrorCode', 'ResponseErrorDescription', 'MainframeFiid', 'MonetaryCardNumberMasked', 'ChName'];
      this.awardsService
        .getMRFFileType(errorType, mainframeIds, from, to)
        .subscribe((response) => {
          if (response.Data) {
            response.Data.forEach((element) => {
              const element2 = element;
              if (element2.MonetaryFileDate) {
                if (element2.MonetaryFileDate == null) {
                  element2.MonetaryFileDate = "";
                } else {
                  element2.MonetaryFileDate = moment(element2.MonetaryFileDate).format(
                    "MM-DD-YYYY"
                  );
                }
              }
              if (element2.MonetaryFileSequence == null) {
                element2.MonetaryFileDate = "";
              }
              element2.ResponseErrorCode =
                element.ResponseErrorCode +
                "-" +
                element.ResponseErrorDescription;
              this.errorList.push(element2);
            });
            this.errorList = response.Data;
            this.onSearch("", this.ddTable);
            // this.errorList = response.Data;
          }
        });
    }
    else {
      this.awardsService
        .getErrorData(errorType, mainframeIds, from, to)
        .subscribe((response) => {
          if (response.Data) {
            this.errorList = response.Data;
            this.onSearch("", this.ddTable);
          }
        });
    }
  }

  private _buildSearchForm() {
    this.searchForm = this._fb.group({
      serviceId: new FormControl(""),
      startDate: new FormControl(this.startDate),
      endDate: new FormControl(this.endDate),
      recordsWorked: new FormControl(false),
      errorFilter: new FormControl(""),
      fiId: new FormControl([]),
    });
  }
  public getuserdetails() {
    this.dropdownListFI = [];
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    this._accountSvc
      .getUserDetailsByUserName(this._userDetails.username)
      .subscribe((response) => {
        const userDetails = response.Data;
        if (response.Data.FIID != 0) {
          this.FIUsers = true;
        }
      });
  }
  FISelectedAll(SelectedFI) {
    this.FiSelect = SelectedFI;
  }
  onItemSelect(item: any) {
    if (item) {
      // if (item.Name && item.Name.length > 39) {
      //   item.Name = item.Name.substring(0, 39) + "...";
      // }
      // let firstitem = this.selectedItems.filter((x) => x.FIID === item.FIID);
      // if (firstitem) {
      //   //firstitem[0] = item;
      // } else {
      //   this.selectedItems = [
      //     { FIID: { ...item.FIID }, Name: { ...item.Name } },
      //   ];
      // }
    }
  }
  private _getFiIds() {
    this.loadingFIDs = true;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (this._userDetails != null) {
      const userid = this._userDetails.userId;
      this._productSvc
        .getProductRtpFIs(this.prodId, userid, this._userDetails.isSysAdmin)
        .subscribe((response) => {
          if (response.Data) {
            this.fiIds = response.Data || [];
            this.dropdownList = this.fiIds;
            this.fiIds.forEach((ids: any) => {
              this.fiIdLists.push(ids.FIID);
              this.FiSelect.push(ids.FIID);
              if (ids.Name && ids.Name.length > 35) {
                ids.Name = ids.Name.substring(0, 35) + "...";
              }
            });
            this.dropdownList = this.fiIds;
          }

          this.loadingFIDs = false;
        });
    }
  }

  onOpenDetailViewClick(bruResponseId) {

    this.bruFile = this.errorList.find(b => b.BruResponseId === bruResponseId);
    this.bruModal.open();
  }

  onCloseBruModalClick() {
    this.bruModal.close();
  }

  public onMrfClick = (mrfResponseId) => {
    //this._buildmrfForm(data.data);
    this.mrfFile = this.errorList.find(b => b.MonetaryResponseId === mrfResponseId);
    this.mrfModal.open();
  }

  public onMrfCancelClick = (data: any, node: any) => {
    this.mrfModal.close();
    //this.mrfForm = null;
    //this.mrfEditing = null;
    //this._getGridData();
    // this.UserEditingReadOnly = null;
  }
}
