import { CONSTANTS } from "./../../../../entities/constants";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { MasterCardRateContext } from "@app/models/mastercardFeeRate";
import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import { UserContext } from "@app/entities/user-context";
import { APP_KEYS } from "@app/entities/app-keys";
// import { AgGridService } from '@shared/components';
import * as _ from "lodash";
import {
  LoggingService,
  ProductService,
  SessionService,
  InputValidationService
} from "@app/services";
import { ToastrService } from "ngx-toastr";
import Swal from "sweetalert2";
import { LocalModalComponent } from "@app/modules/shared/components";
import { max } from "rxjs/operators";
import { ICardFeeRate } from "@app/entities/models";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "mastercard-fee-rate-maintenance",
  templateUrl: "./mastercard-fee-rate-maintenance.html",
  styleUrls: ["./mastercard-fee-rate-maintenance.scss"]
})
export class MastercardFeeRateMaintenancePage
  implements OnInit, AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = "MastercardFeeRateMaintenancePage";

  @ViewChildren("MasterCardRateModal") MasterCardRateModalQuery: QueryList<
    LocalModalComponent
  >;
  MasterCardRateModalSubscription: Subscription;
  MasterCardRateModal: LocalModalComponent;

  public loading = false;
  public saving = false;
  public items: ICardFeeRate[] = null;
  public prodEditing: ICardFeeRate = new ICardFeeRate();
  public rateForm: FormGroup;
  public ResetFilterboxForm: FormGroup;
  public newRate = false;
  public rateEditing = false;
  private Rateselected = 1;
  private _userDetails: UserContext = null;
  SearchForm: FormGroup;
  public productCode;
  public aProduct;
  public IV: InputValidationService = new InputValidationService();
  public prodId = 0;
  cols: any[] = [];
  mastercardList: any = [];
  constructor(
    private _log: LoggingService,
    private _prodSvc: ProductService,
    private _toastr: ToastrService,
    private _fb: FormBuilder,
    private _sessionSvc: SessionService,
    private rout: ActivatedRoute
  ) {
    this.productCode = this.rout.parent.snapshot.params.param;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (this._userDetails && this._userDetails.assginedProducts) {
      let prod = _.filter(
        this._userDetails.assginedProducts,
        prod => prod.productCode === this.productCode
      );
      this.aProduct = prod[0];
      this.prodId = this.aProduct.productId;
    }
  }

  ngOnInit() {
    this.cols = [
      { field: "RateNumber", header: "Rate #" },
      { field: "RateDescription", header: "Description" },
      { field: "Rate", header: "Rate" }
    ];
    this.rateForm = this._fb.group({
      RateID: new FormControl(0, Validators.required),
      RateNumber: new FormControl("", Validators.required),
      RateDescription: new FormControl(""),
      Rate: new FormControl("")
      // , [
      //   Validators.min(0),
      //   Validators.max(99.9999999999)
      // ])
    });
    this.newRate = true;
    this.rateEditing = false;
    this._getGridData();
    this.SearchForm = this._fb.group({
      searchService: new FormControl("")
    });
  }

  ngAfterViewInit() {
    this.MasterCardRateModalSubscription = this.MasterCardRateModalQuery.changes.subscribe(
      (MasterCardRateQuery: QueryList<LocalModalComponent>) => {
        this.MasterCardRateModal = MasterCardRateQuery.first;
        this.MasterCardRateModalSubscription.unsubscribe();
      }
    );
  }
  ngOnDestroy() {
    this.MasterCardRateModalSubscription.unsubscribe();
  }
  public RefreshFilterboxGrid(dataTable: any) {
    this.onSearch("", dataTable);
  }
  filterTimeout = null;
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
    //searchText = searchText.toUpperCase();
  }
  private _getGridData() {
    // this.items = this._prodSvc.getMastercardFeeRates();
    this._prodSvc.getMastercardFeeRates().subscribe(response => {
      if (response) {
        this.items = response;
        this.mastercardList = this.items;
      }
    });
  }

  public onRateEditClick = (data: any) => {
    this.rateEditing = true;
    this.Rateselected = null;
    this.newRate = false;
    this._buildRateForm(data.data);
    this.MasterCardRateModal.open();
  };

  onRateSaveClick() {
    const data = this.rateForm.getRawValue();
    const rateID = this.rateForm.get("RateID").value;

    const Description = this.rateForm.get("RateDescription").value;
    const Rate = this.rateForm.get("Rate").value;
    const RateNumber = this.rateForm.get("RateNumber").value;
    const entry: ICardFeeRate = {
      RateID: rateID,
      RateNumber: RateNumber,
      RateDescription: Description,
      Rate: Rate
    };
    const index = this.items.findIndex(
      (o: ICardFeeRate) => o.RateID === rateID
    );

    //Edit
    const rateFeeEdit = {
      RateID: rateID,
      RateNumber: RateNumber,
      RateDescription: Description,
      Rate: Rate,
      CreateBy: this._userDetails.username,
      UpdateBy: this._userDetails.username
    };
    
    if(this.rateForm.get("Rate").value == null ){
      this._toastr.error(CONSTANTS.quarterlyReportingFeeRateMaintMsgs.invalidRate);
      return;
    }
    this._prodSvc.saveMastercardFeeRates(rateFeeEdit).subscribe(response => {
      if (response) {
        if (!response.Add_Update) {
          this._toastr.warning(response.Message);
          return;
        } else {
          if (this.rateEditing) {
            const editItem: ICardFeeRate = {
              RateID: rateID,
              RateNumber: RateNumber,
              RateDescription: Description,
              Rate: Rate
            };
            this.items[index] = editItem;
          } else {
            this.items.push(entry);
          }
          this.mastercardList = this.items;
          // this._getGridData();
          if (this.MasterCardRateModal.isOpen) {
            this.MasterCardRateModal.close();
          }
          this._toastr.success(
            CONSTANTS.quarterlyReportingFeeRateMaintMsgs.saveRate
          );
        }
      }
    });
    this.newRate = false;
  }

  onRateCancelClick() {
    this.newRate = false;
    if (this.MasterCardRateModal.isOpen) {
      this.rateEditing = false;
      this.MasterCardRateModal.close();
    }
  }

  onRateCreateClick() {
    if (this.MasterCardRateModal.isOpen) {
      this.MasterCardRateModal.close();
    }
    this.newRate = true;
    this._buildRateForm(null);
    this.MasterCardRateModal.open();
  }

  public onRateDeleteClick = (data: any, node: any) => {
    const itm: MasterCardRateContext = data.data;
    // console.log("Returned Item: " + itm);

    (Swal as any)
      .fire({
        title: CONSTANTS.genericCRUDMsgs.deleteConfirm,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          const index = this.items.findIndex(
            (o: MasterCardRateContext) =>
              o.RateID === itm.RateID && o.RateNumber === itm.RateNumber
          );
          if (index >= 0) {
            this.items.splice(index, 1);
            this.mastercardList = this.items;
          }
        }
      });
  };

  collaspeAll() {}

  private _buildRateForm(formRate: ICardFeeRate = new ICardFeeRate()) {
    this.prodEditing = formRate;
    if (this.rateEditing && this.prodEditing.RateID) {
      this.rateForm = this._fb.group({
        RateID: new FormControl(this.prodEditing.RateID, Validators.required),
        RateNumber: new FormControl(
          this.prodEditing.RateNumber,
          Validators.required
        ),
        RateDescription: new FormControl(this.prodEditing.RateDescription),
        Rate: new FormControl(this.prodEditing.Rate)
      });
    } else {
      this.rateForm = this._fb.group({
        RateID: new FormControl(0, Validators.required),
        RateNumber: new FormControl("", Validators.required),
        RateDescription: new FormControl(""),
        Rate: new FormControl("")
      });
    }
  }
}
