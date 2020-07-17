import { VaultService } from "./../../../../services/vault.svc";
import {
  Component,
  ViewEncapsulation,
  ElementRef,
  ChangeDetectionStrategy,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormArray,
  ValidatorFn,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import {
  DialogService,
  SessionService,
  FiService,
  LoggingService,
  ProductService,
  InputValidationService,
} from "@app/services";
import { LocalModalComponent } from "@shared/components";
import {
  BinContext,
  BinSetupContext,
  FiContext,
  IConfigItem,
  IProductVersion,
} from "@entities/models";
import { CONSTANTS } from "@entities/constants";
import { ICardICA } from "@app/entities/models";
import { UserContext } from "./../../../../entities/user-context";
import { APP_KEYS } from "@entities/app-keys";
import * as moment from "moment";
import * as _ from "lodash";
import { DialogConfig, DialogTypes } from "@entities/dialog";
import Swal from "sweetalert2";
import { Subscription } from "rxjs";

@Component({
  selector: "ga-fi-admin",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./fi-admin.scss"],
  templateUrl: "./fi-admin.html",
})
export class GA_FiAdminPage implements AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = "GA_FiAdminPage";

  @ViewChildren("fiModal") fiModalQuery: QueryList<LocalModalComponent>;
  @ViewChildren("binModal") binModalQuery: QueryList<LocalModalComponent>;
  @ViewChildren("rowDetailModal") rowDetailModalQuery: QueryList<
    LocalModalComponent
  >;

  fiModalQuerySubscription: Subscription;
  binModalQuerySubscription: Subscription;
  rowDetailModalQuerySubscription: Subscription;
  fiModal: LocalModalComponent;
  binModal: LocalModalComponent;
  rowDetailModal: LocalModalComponent;

  public loading = false;
  public loadingnewDetail = false;
  public isFormSubmit = false;
  public saving = false;
  public items: FiContext[] = null;
  public searchText = "";
  public resultCount = 0;
  public isEditing = false;
  public binEditing = false;
  public isValidBin = false;
  public action = "Add";
  public isbinDetails = false;
  public isbinsave = false;
  public selectedSharedSys = false;
  public childindex = 0;
  public IV: InputValidationService = new InputValidationService();
  public expandflag = false;
  public previoussearchtext = "";

  public mastercardICAList: ICardICA[] = [];
  public loadingMasterCardICAID = false;
  public selectedMasterCardICAID = 0;
  public selectedIcaType = "";
  public loadingBinSetupDetails = false;
  public BinSetupListList = [];
  public BinSetupList: BinContext[] = [];
  public BinSetupDetailList: BinSetupContext[] = [];
  public binsetups: BinContext[] = [];
  public binexpandCardtype = "";
  public binexpandbinNumber = "";
  public viewData: any = {};
  public binexpandSharedSys = "";
  public binexpandIca = "";
  public binexpandpanPattern = "";

  public fiEditing: FiContext = null;
  public fiEditingReadOnly: FiContext = null;
  public fiForm: FormGroup;
  public Nums: FormArray;
  public binForm: FormGroup;
  public ResetFilterboxForm: FormGroup;
  public _userDetails: UserContext = null;
  fiList: any = [];
  cols: any[] = [];
  expandedRows: any[] = [];
  public datatable1: any;

  constructor(
    private _fb: FormBuilder,
    private _fiSvc: FiService,
    private _dialogSvc: DialogService,
    private _prodSvc: ProductService,
    private _sessionSvc: SessionService,
    private _toastr: ToastrService,
    private _log: LoggingService
  ) {}

  ngOnInit() {
    this.isValidBin = false;
    this._log.debug(`${this.CLASSNAME} > ngOnInit()`);
    this.cols = [
      { field: "fiId", header: "FI ID" },
      { field: "aba", header: "ABA Number" },
      { field: "fiName", header: "Name" },
      { field: "fiNameShort", header: "Short Name" },
      { field: "mainframeId", header: "Mainframe FIID" },
      { field: "isFdcMigrated", header: "Migrated to FDC" },
      { field: "pscuClientId", header: "PSCU Client ID" },
      { field: "address", header: "Address" },
      { field: "city", header: "City" },
      { field: "state", header: "State" },
      { field: "zip", header: "Zip" },
      { field: "zip4", header: "Extended Zip" },
    ];
    // this._initGridConfig();
    this._buildFiForm();
    this._getGridData();
    this.retrieveIca();
  }

  ngAfterViewInit() {
    this.fiModalQuerySubscription = this.fiModalQuery.changes.subscribe(
      (fiQuery: QueryList<LocalModalComponent>) => {
        this.fiModal = fiQuery.first;
        this.fiModalQuerySubscription.unsubscribe();
      }
    );
    this.binModalQuerySubscription = this.binModalQuery.changes.subscribe(
      (binQuery: QueryList<LocalModalComponent>) => {
        this.binModal = binQuery.first;
        this.binModalQuerySubscription.unsubscribe();
      }
    );
    this.rowDetailModalQuerySubscription = this.rowDetailModalQuery.changes.subscribe(
      (rowDetailQuery: QueryList<LocalModalComponent>) => {
        this.rowDetailModal = rowDetailQuery.first;
        this.rowDetailModalQuerySubscription.unsubscribe();
      }
    );
  }

  ngOnDestroy() {
    this.fiModalQuerySubscription.unsubscribe();
    this.binModalQuerySubscription.unsubscribe();
    this.rowDetailModalQuerySubscription.unsubscribe();
  }

  public retrieveBinSetupDetails(binid: any) {
    this.loadingBinSetupDetails = true;
    this.BinSetupDetailList = [];
    this._fiSvc.RetrieveBinSetupInformation(binid).subscribe(
      (response) => {
        if (response && response.length > 0) {
          if (this.binForm != null) {
            this.Nums = this.binForm.get("Nums") as FormArray;
            while (this.Nums.length !== 0) {
              this.Nums.removeAt(0);
            }
          }

          response.forEach((BinDetaillist: BinSetupContext) => {
            let updateBinsetupDetail: any = {
              BnsId: BinDetaillist.BnsId,
              PscuSysNum: BinDetaillist.PscuSysNum,
              PscuPrinNum: BinDetaillist.PscuPrinNum,
              MerchantNum: BinDetaillist.MerchantNum,
              AgentNum: BinDetaillist.AgentNum,
            };
            this.BinSetupDetailList.push(updateBinsetupDetail);
            if (this.binForm != null) {
              let formG: FormGroup = this._fb.group({
                BnsId: BinDetaillist.BnsId,
                PscuSysNum: [
                  BinDetaillist.PscuSysNum,
                  [
                    Validators.minLength(4),
                    Validators.maxLength(4),
                    Validators.required,
                    this.Numeric(),
                  ],
                ],
                PscuPrinNum: [
                  BinDetaillist.PscuPrinNum,
                  [
                    Validators.minLength(4),
                    Validators.maxLength(4),
                    Validators.required,
                    this.Numeric(),
                  ],
                ],
                AgentNum: [
                  BinDetaillist.AgentNum,
                  [
                    Validators.minLength(4),
                    Validators.maxLength(4),
                    Validators.required,
                    this.Numeric(),
                  ],
                ],
                MerchantNum: [
                  BinDetaillist.MerchantNum,
                  [
                    Validators.minLength(0),
                    Validators.maxLength(16),
                    this.Numeric(),
                  ],
                ],
                EditMod: false,
              });
              this.Nums.push(formG);
            }
          });
        } else {
          if (this.binForm != null) {
            this.Nums = this.binForm.get("Nums") as FormArray;
            while (this.Nums.length !== 0) {
              this.Nums.removeAt(0);
            }
            this.addDetailRow();
          }
        }
      },
      (err: any) => {
        this.loadingBinSetupDetails = false;
      }
    );
    this.loadingBinSetupDetails = false;
    this.isbinDetails = true;
  }

  public retrieveIca() {
    this.loadingMasterCardICAID = true;

    this._prodSvc.getICAMaintenance().subscribe(
      (response) => {
        if (response && response.length > 0) {
          response.forEach((mcICAlist: ICardICA) => {
            this.mastercardICAList.push(mcICAlist);
          });
        }
      },
      (err: any) => {
        this.loadingMasterCardICAID = false;
      }
    );
    this.loadingMasterCardICAID = false;
  }

  MCICAChange(MCICAlist) {
    this.selectedMasterCardICAID = MCICAlist.target.value;
    let selectedOptions = event.target["options"];
    let selectedIndex = selectedOptions.selectedIndex;
    let selectElementText = selectedOptions[selectedIndex].text;
    this.selectedIcaType = selectElementText;
  }

  // public RefreshFilterboxGrid(){
  //   this.onSearch('');
  // }
  // public onSearch(searchText: string) {
  //   this.searchText = searchText.toUpperCase();
  //   this._setGridData();
  // }
  filterTimeout = null;
  public onSearch(searchText: string, datatable: any): void {
    // if(this.filterTimeout) {
    //   clearTimeout(this.filterTimeout);
    // }
    // this.filterTimeout = setTimeout(()=>{
    //     if (datatable) {
    //     datatable.filterGlobal(searchText, 'contains')
    //   }
    // },250);
    if (this.datatable1) {
    } else {
      this.datatable1 = datatable;
    }
    if (this.previoussearchtext) {
    } else {
      this.searchText = this.previoussearchtext;
    }
    if (datatable) {
      datatable.filterGlobal(searchText, "contains");
    }
    searchText = searchText.toUpperCase();
    this.previoussearchtext = searchText;
  }
  public RefreshFilterboxGrid(env: any, dataTable: any) {
    this.onSearch("", dataTable);
  }

  public clearText() {
    this.searchText = "";
  }

  sharedSysChangeEvent(event) {
    if (event.target.checked) {
      this.selectedSharedSys = true;
    } else {
      this.selectedSharedSys = false;
    }
  }

  public onFiCreateClick = ($event: any) => {
    this.isEditing = false;
    if (this.fiModal.isOpen || this.binModal.isOpen) return;

    this._buildFiForm();
    this.fiModal.open();
  };

  public onFiEditClick = (data: any) => {
    this._buildFiForm(data.data);
    console.log(
      "My Datatable is" +
        this.datatable1 +
        "my searchtext is" +
        this.previoussearchtext
    );
    this.fiModal.open();
  };

  public onBinEditClick = (data: any) => {
    this._buildBinForm(data.data.fiId);
    this.action = "Edit";
    this.isbinDetails = true;
    this.binEditing = true;
    this.isValidBin = true;
    this.selectedIcaType = data.data.icaNumber;
    this.selectedSharedSys = data.data.SharedSys;
    this.getICAId(data.data.icaNumber);
    this._editBinForm(data.data);
    this.retrieveBinSetupDetails(data.data.binNumber);
    this.binModal.open();
  };

  public getICAId(icaNumber: string) {
    let i = 0;
    let IcaId = 0;
    for (i = 0; i <= this.mastercardICAList.length - 1; i++) {
      if (this.mastercardICAList[i].ICA.toString() == icaNumber) {
        IcaId = this.mastercardICAList[i].ICAID;
      }
    }
    this.selectedMasterCardICAID = IcaId;
  }
  public onFiSaveClick = () => {
    let data = this._getValidFiFormModel();
    if (!data) return;

    if (!this.mandatoryFieldsPresent()) {
      this._toastr.error(CONSTANTS.genericCRUDMsgs.invalidInputs);
      return;
    }

    let isAddNew = false;
    if (!this.fiEditing.fiId) {
      isAddNew = true;
    } else {
      if (this.fiEditing.fiId) data = _.merge(this.fiEditing, data);
    }

    if (
      (this.fiEditing &&
        this.fiEditing.aba &&
        this.fiEditing.aba.length !== 9) ||
      (isAddNew && data.aba && data.aba.length !== 9)
    ) {
      this._toastr.error(CONSTANTS.adminfiadminMsgs.invalidABA);
      return;
    }

    const duplicateABAFound = this.items.findIndex((x) => x.aba === data.aba);
    if (duplicateABAFound > -1 && this.fiEditing.fiId === undefined) {
      const cfg = _.merge(new DialogConfig(), {
        dialogType: DialogTypes.YesNo,
        title: "Confirm Save",
        text: CONSTANTS.adminfiadminMsgs.itemDuplicateConfirm,
        okButtonCallback: () => {
          this.isEditing = true;
          this.saveFI(data, duplicateABAFound, isAddNew);
        },
      });

      this._dialogSvc.show(cfg);

      if (!this.isEditing) return;
    }

    this.saveFI(data, duplicateABAFound, isAddNew);
  };

  saveFI(data, duplicateABAFound, isAddNew) {
    if (this.fiEditing.fiId) data = _.merge(this.fiEditing, data);

    data.fiId = data.fiId || 0;

    this._log.debug(`${this.CLASSNAME} > onFiSaveClick() > fiForm: `, data);
    this.saving = true;
    this._fiSvc.saveFi(data).subscribe(
      (response) => {
        if (response.errorMessages.length) {
          response.errorMessages.forEach((msg: string) => {
            this._toastr.error(msg);
          });
          if (data.fiId > 0) {
            data = _.merge(data, this.fiEditingReadOnly);
          }
          return;
        }
        if (response.data && response.data.fiId) {
          if (duplicateABAFound >= 0)
            // UPDATE
            this.items.splice(duplicateABAFound, 1, response.data);
          else if (isAddNew) {
            // Add New
            this.items.push(response.data);
          }
        }
        console.log(
          "My Datatable again is" +
            this.datatable1 +
            "my searchtext is" +
            this.previoussearchtext
        );

        // this.onSearch(this.previoussearchtext,this.datatable1);
        this._getGridData();
        this.fiModal.close();
        this.fiEditing = null;
        this.fiForm = null;
        this.fiEditingReadOnly = null;
        this._toastr.success("FI " + CONSTANTS.genericCRUDMsgs.saveSuccess);
      },
      (err) => {
        this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
      },
      () => {
        this.saving = false;
      }
    );
  }

  public onFiCancelClick = (data: any, node: any) => {
    this.fiModal.close();
    this.fiEditing = null;
    this.fiForm = null;
    this.fiEditingReadOnly = null;
  };

  public onFiDeleteClick = (data: any, node: any) => {
    (Swal as any)
      .fire({
        title: CONSTANTS.genericCRUDMsgs.deleteConfirm,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      })
      .then((result) => {
        if (result.value) {
          this._fiSvc.deleteFi(data.data.fiId).subscribe((response) => {
            if (!response.isDeleted) {
              this._toastr.error(response.Message.toString());
            }
            if (response.isDeleted) {
              let index = this.items.findIndex((i: FiContext) => {
                return data.data.fiId === i.fiId;
              });

              if (index >= 0) this.items.splice(index, 1);

              this._toastr.success(
                "FI " + CONSTANTS.genericCRUDMsgs.deleteSuccess
              );
              this._getGridData();
            }
          });
        }
      });
  };

  public onBinCreateClick = (params: any) => {
    this.action = "Add";
    this.BinSetupDetailList = [];
    this.isbinDetails = true;
    if (!params || !params.data || !params.data.fiId) return;

    let item = params.data;
    this.selectedMasterCardICAID = 0;
    this._buildBinForm(item.fiId);
    this.binModal.open();
  };

  public onBinSaveClick() {
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (
      this.binForm.get("BinNumber").value.length < 6 ||
      this.binForm.get("BinNumber").value.length > 9
    ) {
      this._toastr.error(CONSTANTS.adminfiadminMsgs.invalidBIN);
      return;
    }
    this.isFormSubmit = true;
    setTimeout(() => {
      this.isFormSubmit = false;
    }, 7000);
    let data = this._getValidBinFormModel();
    if (!data) {
      return;
    }

    if (this.binEditing === false) data.binId = 0;
    if (this.selectedIcaType == "") {
      data.IcaNumber = null;
    } else {
      data.IcaNumber = this.selectedIcaType;
    }
    if (data.SharedSys == null || data.SharedSys == "") {
      data.SharedSys = false;
    } else {
      data.SharedSys = data.SharedSys;
    }
    data.CreateBy = this._userDetails.username;
    const BinSetupDetailsData = data.Nums;
    delete data.Nums;
    this.saving = true;

    this._fiSvc.SaveBinInformation(data).subscribe(
      (response) => {
        if (response.Resp_BinID) {
          let binnumber = this.binForm.get("BinNumber").value;
          if (BinSetupDetailsData.length > 0) {
            BinSetupDetailsData.forEach((bn) => {
              if (bn.PscuSysNum != "" && bn.PscuPrinNum != "") {
                if (bn.BnsId > 0) {
                  let request: any = {
                    BnsID: bn.BnsId,
                    binNumber: binnumber,
                    PscuSysNum: bn.PscuSysNum,
                    PscuPrinNum: bn.PscuPrinNum,
                    MerchantNum: bn.MerchantNum,
                    AgentNum: bn.AgentNum,
                  };
                  this._fiSvc.saveBinSetupDetail(request).subscribe(
                    (response) => {},
                    (err) => {}
                  );
                } else {
                  let request: any;
                  request = {
                    binNumber: binnumber,
                    PscuSysNum: bn.PscuSysNum,
                    PscuPrinNum: bn.PscuPrinNum,
                    MerchantNum: bn.MerchantNum,
                    AgentNum: bn.AgentNum,
                    CreateBy: this._userDetails.username,
                    UpdateBy: this._userDetails.username,
                  };
                  this._fiSvc.saveBinSetupDetail(request).subscribe(
                    (response) => {},
                    (err) => {}
                  );
                }
              }
            });
            // this._toastr.success("Successfully saved Bin.");
            this._toastr.success(
              "Bin Details " + CONSTANTS.genericCRUDMsgs.saveSuccess
            );
          }
          this._getGridData();
          this.retrieveBinSetupDetails(binnumber);
          this.isbinDetails = false;
          this.loadingnewDetail = false;
          this.binModal.close();
          this.saving = false;
          this.binForm = null;
          this.binEditing = false;
          this.BinSetupDetailList = [];
          this.selectedMasterCardICAID = 0;
          this.selectedIcaType = "";
        }
      },
      (err) => {
        this.saving = false;
        this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
      }
    );
  }

  // public newbinsetupadd(binnumber:any){
  //   if(this.isbinsave){
  //     if(this.action == 'Add')
  //     {
  //       if(this.BinSetupDetailList.length>0)
  //     {
  //       this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
  //       let i = 0;
  //       for (i = 0; i <= this.BinSetupDetailList.length - 1; i ++) {
  //         let request :any ;
  //         request= '';
  //         request= {
  //           binNumber : binnumber,
  //           PscuSysNum : this.BinSetupDetailList[i].PscuSysNum ,
  //           PscuPrinNum : this.BinSetupDetailList[i].PscuPrinNum,
  //           MerchantNum : this.BinSetupDetailList[i].MerchantNum,
  //           AgentNum : this.BinSetupDetailList[i].AgentNum,
  //           CreateBy : this._userDetails.username,
  //           UpdateBy : this._userDetails.username
  //         }
  //         this._fiSvc.saveBinSetupDetail(request).subscribe(
  //           response => {
  //             if(response.Message)  {
  //               this._toastr.success('Bin Setup Details Saved Successfully.');
  //               this._getGridData();
  //             }
  //           },
  //           err => {
  //             // this.saving = false;
  //             this._toastr.error('Failed to save bin details. Please try again.');
  //         });
  //       }
  //       ///complete loop all records
  //   }

  //   }
  //   }
  //   this.retrieveBinSetupDetails(binnumber);
  //   this.isbinDetails = false;
  //   this.loadingnewDetail = false;
  //   this.binModal.close();
  //   this.saving = false;
  //   this.binForm = null;
  //   this.binEditing = false;
  //   this.BinSetupDetailList =[];

  // }
  public onBinCancelClick = (data: any, node: any) => {
    this.binModal.close();
    this.binForm = null;
    this.binEditing = false;
    this.selectedMasterCardICAID = 0;
    this.loadingnewDetail = false;
    this.BinSetupDetailList = [];
  };

  public onBinDeleteClick = (data: any, node: any) => {
    (Swal as any)
      .fire({
        title: CONSTANTS.genericCRUDMsgs.deleteConfirm,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      })
      .then((result) => {
        if (result.value) {
          this._fiSvc.deleteBin(data.data.binId).subscribe((response) => {
            if (!response.isDeleted) {
              this._toastr.error(response.Message.toString());
            } else if (response.isDeleted) {
              let currentFi = this.items.find((fi: FiContext) => {
                return fi.fiId === data.data.fiId;
              });
              let index = currentFi.bins.findIndex((b: BinContext) => {
                return b.binId === data.data.binId;
              });

              if (index >= 0) currentFi.bins.splice(index, 1);

              this._getGridData();
              this._toastr.success(
                "BIN " + CONSTANTS.genericCRUDMsgs.deleteSuccess
              );
            }
          });
        }
      });
  };

  public addDetailRow() {
    this.loadingnewDetail = true;
    this.Nums = this.binForm.get("Nums") as FormArray;
    this.Nums.push(this.createItem());
  }
  public EditBinSetupDetailRow(index: any) {
    const nd = this.binForm.value.Nums;
    this.Nums = this.binForm.get("Nums") as FormArray;
    while (this.Nums.length !== 0) {
      this.Nums.removeAt(0);
    }
    let i = 0;
    this.BinSetupDetailList.forEach((BinDetaillist: any) => {
      let formG: FormGroup = this._fb.group({
        BnsId: nd[i].BnsId,
        PscuSysNum: [
          nd[i].PscuSysNum,
          [
            Validators.minLength(4),
            Validators.maxLength(4),
            Validators.required,
            this.Numeric(),
          ],
        ],
        PscuPrinNum: [
          nd[i].PscuPrinNum,
          [
            Validators.minLength(4),
            Validators.maxLength(4),
            Validators.required,
            this.Numeric(),
          ],
        ],
        AgentNum: [
          nd[i].AgentNum,
          [
            Validators.minLength(4),
            Validators.maxLength(4),
            Validators.required,
            this.Numeric(),
          ],
        ],
        MerchantNum: [
          nd[i].MerchantNum,
          [Validators.minLength(0), Validators.maxLength(16), this.Numeric()],
        ],
        EditMod: index == i ? true : nd[i].EditMod,
      });
      this.Nums = this.binForm.get("Nums") as FormArray;
      this.Nums.push(formG);
      i += 1;
    });
    // if (index > -1) {
    //   let currentbinnumber = this.binForm.controls['BinNumber'].value;
    //   let currentBnsID = this.BinSetupDetailList[index].BnsId;
    //   let PscuSysNum = this.binForm.value.Nums[index].PscuSysNum;
    //   let PscuPrinNum = this.binForm.value.Nums[index].PscuPrinNum;
    //   let MerchantNum = this.binForm.value.Nums[index].MerchantNum;
    //   let AgentNum = this.binForm.value.Nums[index].AgentNum;

    //   //still work in progress need to make dynamic
    //     let request:any = {
    //     BnsID : currentBnsID,
    //     binNumber : currentbinnumber,
    //     PscuSysNum : PscuSysNum ,
    //     PscuPrinNum : PscuPrinNum,
    //     MerchantNum : MerchantNum,
    //     AgentNum : AgentNum
    //   }
    //   this._fiSvc.saveBinSetupDetail(request).subscribe(
    //     response => {
    //       if (response.Message) {
    //       this._toastr.success('Bin setup details saved successfully');
    //       }
    //       this.retrieveBinSetupDetails(currentbinnumber);
    //       this.isbinDetails = true;
    //       this.loadingnewDetail = false;
    //       this._toastr.success('Bin setup details saved successfully!');
    //     },
    //     err => {
    //       // this.saving = false;
    //       this._toastr.error('Failed to save changes. Please try again.');
    //     });
    //   }
  }

  Numeric(): ValidatorFn {
    return (c: FormControl): { [key: string]: boolean } | null => {
      if (c.value) {
        let regEx = new RegExp(/^[0-9]*$/);
        if (!regEx.test(c.value)) {
          return { numeric: true };
        }
      }
      return null;
    };
  }

  public DeleteBinSetupDetailRow(index: any) {
    if (index > -1) {
      if (this.BinSetupDetailList[index]) {
        let currentbinsetupid = this.BinSetupDetailList[index].BnsId;
        let currentbinnumber = this.binForm.controls["BinNumber"].value;

        (Swal as any)
          .fire({
            title: CONSTANTS.genericCRUDMsgs.deleteConfirm,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
          })
          .then((result) => {
            if (result.value) {
              this._fiSvc
                .deleteBinSetup(currentbinsetupid)
                .subscribe((response) => {
                  if (!response.isDeleted) {
                    this._toastr.error(response.Message.toString());
                  } else if (response.isDeleted) {
                    this.Nums = this.binForm.get("Nums") as FormArray;
                    this.retrieveBinSetupDetails(currentbinnumber);
                    this._toastr.success(
                      "BIN Setup " + CONSTANTS.genericCRUDMsgs.deleteSuccess
                    );
                  }
                });
            }
          });
      } else {
        this.Nums.removeAt(index);
      }
    }
  }

  // public SaveDetailRow = (event:any) => {
  //   this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
  //   if(this.action == 'Add'){

  //   //add bin setup details to list

  //   let cacheBinsetupDetail:any = {
  //     binNumber : this.binForm.controls['BinNumber'].value,
  //     PscuSysNum : this.binForm.controls['pscuSysNum'].value,
  //     PscuPrinNum : this.binForm.controls['pscuPrinNum'].value,
  //     MerchantNum: this.binForm.controls['MerchantNum'].value,
  //     AgentNum: this.binForm.controls['AgentNum'].value

  //   }
  //   this.BinSetupDetailList.push(cacheBinsetupDetail)
  //   this.loadingnewDetail = false;
  //   this.isbinDetails = true;
  //   this.binForm.controls['pscuSysNum'].setValue('');
  //   this.binForm.controls['pscuPrinNum'].setValue('');
  //   this.binForm.controls['MerchantNum'].setValue('');
  //   this.binForm.controls['AgentNum'].setValue('');

  //   //add bin first
  //   //this.onBinSaveClick();

  //   }
  //   if(this.action == 'Edit'){
  //  //JLY
  //  // this.BinSetupDetailList = [];
  //   let data = this.binForm.getRawValue();
  //   let binnum = data.BinNumber;
  //   data.CreateBy = this._userDetails.username;
  //   data.UpdateBy = this._userDetails.username;
  //   //JLY
  //   delete data.Nums;
  //   this._fiSvc.saveBinSetupDetail(data).subscribe(
  //       response => {
  //         if (response.Message) {
  //           this._toastr.success('Bin setup details saved successfully!');
  //           this.isbinDetails = true;
  //         }
  //         this.retrieveBinSetupDetails(binnum);
  //         this.isbinDetails = true;
  //         // this.saving = false;
  //         this.loadingnewDetail = false;
  //         this.binForm.controls['pscuSysNum'].setValue('');
  //         this.binForm.controls['pscuPrincipalNum'].setValue('');
  //         this.binForm.controls['agent'].setValue('');
  //         this.binForm.controls['pscuMerchantNum'].setValue('');
  //        // binnum = '';

  //       },
  //       err => {
  //         // this.saving = false;
  //         this._toastr.error('Failed to save changes. Please try again.');
  //       });
  //     }
  // }

  // public CancelDetailRow(){
  //   this.loadingnewDetail = false;
  //   this.binForm.controls['pscuSysNum'].setValue('');
  //   this.binForm.controls['pscuPrincipalNum'].setValue('');
  //   this.binForm.controls['agent'].setValue('');
  //   this.binForm.controls['pscuMerchantNum'].setValue('');
  // }

  private _getGridData() {
    this.loading = true;
    this._fiSvc.getFIs().subscribe(
      (response) => {
        this.items = this._evalFIs(response.data || []);
        this.fiList = [...this.items];
        const sorted: FiContext[] = this.fiList.sort((A, B) => {
          if (A.fiId > B.fiId) {
            return 1;
          }
          if (A.fiId < B.fiId) {
            return -1;
          }
        });

        this.fiList = sorted;

        this.resultCount = this.items.length;
        // if(this.previoussearchtext == 'undefined'){
        //   this.previoussearchtext = '';
        // }
        // this.onSearch(this.previoussearchtext,this.fiList);
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
      }
    );
    this.onSearch("", this.datatable1);
  }

  // private _setGridData() {
  //   if (!this.grid)
  //     return;

  //   if (this.searchText) {
  //    this.searchText = this.searchText.toUpperCase();
  //     let items = this.items.filter((item: FiContext) => {

  //     if(item.fiName != null && item.fiName.toUpperCase().includes(this.searchText.toUpperCase()))
  //      return item.fiName.toUpperCase().indexOf(this.searchText)  >= 0;

  //     if(item.aba != null && item.aba.toUpperCase().includes(this.searchText.toUpperCase()))
  //     return item.aba.toUpperCase().indexOf(this.searchText) >= 0;

  //     if(item.mainframeId != null && item.mainframeId.toUpperCase().includes(this.searchText.toUpperCase()))
  //     return item.mainframeId.toUpperCase().indexOf(this.searchText) >= 0;

  //     else if (!item || !item.fiName)
  //         return false;

  //    //  return item.fiName.toUpperCase().indexOf(this.searchText) >= 0;
  //     });

  //     this.grid.setRowData(items);
  //     this.resultCount = items.length;
  //   }
  //   else {
  //     this.resultCount = this.items.length;
  //     this.grid.setRowData(this.items || []);
  //   }
  // }

  private _getValidFiFormModel() {
    let data = this.fiForm.value;
    if (!data.aba) {
      this._toastr.error(CONSTANTS.adminfiadminMsgs.invalidABA);
      return null;
    }

    if (!data.fiName) {
      this._toastr.error(CONSTANTS.adminfiadminMsgs.invalidFIName);
      return null;
    }

    return data;
  }

  public alphaNumericOnly(env: any) {
    const charCode = env.charCode;

    const isDigit = charCode < 48 || charCode > 57 ? false : true;
    const isLowerAlpha = charCode < 65 || charCode > 90 ? false : true;
    const isUpperAlpha = charCode < 97 || charCode > 122 ? false : true;

    const isValid = isDigit || isLowerAlpha || isUpperAlpha;
    if (!isValid) {
      this._toastr.error("Invalid data.  Please enter a alphanumeric value.");
    }

    return isValid;
  }

  public restrictToAplhatwoChars(env: any) {
    let val = env.target.value;
    if (val.length == 2) {
      val = val.substring(1, 2);
    }

    let asciiCode = val.charCodeAt(0);
    if (
      (asciiCode < 65 || asciiCode > 90) &&
      (asciiCode < 97 || asciiCode > 122)
    ) {
      env.target.value = "";
    }

    env.target.value = env.target.value.replace(/[^A-Za-z][^A-Za-z]/g, "");
  }

  restrictToNumeric(env: any) {
    const keyValue = Number(JSON.stringify(env.target.value));

    if (
      this.binForm &&
      (this.binForm.value.BinNumber.length > 6 ||
        this.binForm.value.BinNumber.length < 9)
    ) {
      this.isValidBin = true;
    }

    if (keyValue < 48 || keyValue > 57) {
      this._toastr.error("Invalid data.  Please enter a valid value.");
    }
    env.target.value = env.target.value.replace(/[^0-9]/g, "");
  }

  isFieldInvalid(index: number, fieldName: string): boolean {
    let fieldControl = this.binForm.get("Nums")["controls"][index]["controls"][
      fieldName
    ];
    return fieldControl.invalid && (fieldControl.dirty || fieldControl.touched);
  }
  private _getValidBinFormModel() {
    let data = this.binForm.value;
    if (
      data.Nums[0].PscuSysNum != "" ||
      data.Nums[0].PscuPrinNum != "" ||
      data.Nums[0].AgentNum != ""
    ) {
      if (this.binForm.controls["Nums"].invalid) {
        this._toastr.error(CONSTANTS.adminfiadminMsgs.invalidBINDetails);
        return null;
      }
    }
    // if(this.binForm.invalid){
    //   this._toastr.error('Invalid data,  Please enter a valid value.');
    //   return null;
    // }
    if (!data.BinNumber) {
      this._toastr.error(CONSTANTS.adminfiadminMsgs.invalidBIN);
      return null;
    }
    return data;
  }

  private _evalFIs(items: FiContext[] = []) {
    items.forEach((itm: FiContext) => {
      if (itm.createDateTime) {
        itm.createDateTime = moment(itm.createDateTime).format(
          "MMM DD, YYYY HH:mm:ss"
        );
      }

      if (itm.updateDateTime) {
        itm.updateDateTime = moment(itm.updateDateTime).format(
          "MMM DD, YYYY HH:mm:ss"
        );
      }

      if (itm.bins && itm.bins.length) {
        itm.bins.forEach((n: BinContext) => {
          if (n.createDateTime) {
            n.createDateTime = moment(n.createDateTime).format(
              "MMM DD, YYYY HH:mm:ss"
            );
          }

          if (n.updateDateTime) {
            n.updateDateTime = moment(n.updateDateTime).format(
              "MMM DD, YYYY HH:mm:ss"
            );
          }
        });
      }
    });

    return items;
  }
  public onBinAdditionalDetailCloseClick() {
    this.rowDetailModal.close();
  }

  onExpandView(data: any) {
    this.viewData = data.data;
    this.expandflag = true;
    this.retrieveBinSetupDetails(data.data.binNumber);
    this.rowDetailModal.open();
  }

  public onBINDetailCloseClick() {
    this.rowDetailModal.close();
  }

  private _buildFiForm(fi: FiContext = {}) {
    this.ResetFilterboxForm = this._fb.group({});
    this.fiEditing = fi;
    this.fiEditingReadOnly = { ...this.fiEditing };
    if (this.fiEditing.fiId) {
      this.fiForm = this._fb.group({
        fiId: new FormControl(this.fiEditing.fiId, Validators.required),
        aba: new FormControl(this.fiEditing.aba, Validators.required),
        pscuClientId: new FormControl(
          this.fiEditing.pscuClientId,
          Validators.required
        ),
        mainframeId: new FormControl(
          this.fiEditing.mainframeId,
          Validators.required
        ),
        fiName: new FormControl(this.fiEditing.fiName, Validators.required),
        fiNameShort: new FormControl(
          this.fiEditing.fiNameShort,
          Validators.required
        ),
        isFdcMigrated: new FormControl(
          this.fiEditing.isFdcMigrated,
          Validators.required
        ),
        address: new FormControl(this.fiEditing.address, Validators.required),
        city: new FormControl(this.fiEditing.city, Validators.required),
        state: new FormControl(this.fiEditing.state, Validators.required),
        zip: new FormControl(this.fiEditing.zip, Validators.required),
        zip4: new FormControl(this.fiEditing.zip4, Validators.required),
      });
    } else {
      this.fiForm = this._fb.group({
        fiId: new FormControl(0, Validators.required),
        aba: new FormControl("", Validators.required),
        pscuClientId: new FormControl("", Validators.required),
        mainframeId: new FormControl("", Validators.required),
        fiName: new FormControl("", Validators.required),
        fiNameShort: new FormControl("", Validators.required),
        isFdcMigrated: new FormControl(false, Validators.required),
        address: new FormControl("", Validators.required),
        city: new FormControl("", Validators.required),
        state: new FormControl("", Validators.required),
        zip: new FormControl("", Validators.required),
        zip4: new FormControl(""),
      });
    }
  }

  private _buildBinForm(fiId: number) {
    //NOTE: BINs cannot be edited, so it's always a create.
    this.binForm = this._fb.group({
      FIID: new FormControl(fiId),
      BinID: new FormControl(""),
      BinNumber: new FormControl("", Validators.required),
      ICA: new FormControl("0"),
      SharedSys: new FormControl(false),
      PanPattern: new FormControl(""),
      PscuSysNum: new FormControl(""),
      PscuPrinNum: new FormControl(""),
      AgentNum: new FormControl(""),
      MerchantNum: new FormControl(""),
      Nums: this._fb.array([this.createItem()]),
    });
  }

  private _editBinForm(binData: BinContext) {
    this.binForm.patchValue({
      FIID: binData.fiId,
      BinID: binData.binId,
      BinNumber: binData.binNumber,
      ICA: this.selectedMasterCardICAID,
      SharedSys: binData.sharedSys,
      PanPattern: binData.panPattern,
    });
  }
  createItem(): FormGroup {
    return this._fb.group({
      BnsId: 0,
      PscuSysNum: [
        "",
        [
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.required,
          this.Numeric(),
        ],
      ],
      PscuPrinNum: [
        "",
        [
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.required,
          this.Numeric(),
        ],
      ],
      AgentNum: [
        "",
        [
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.required,
          this.Numeric(),
        ],
      ],
      MerchantNum: [
        "",
        [Validators.minLength(0), Validators.maxLength(16), this.Numeric()],
      ],
      EditMod: true,
    });
  }
  onToggle() {}

  collaspeAll() {
    this.expandedRows = [];
  }

  private mandatoryFieldsPresent(): boolean {
    const abaNumberPresent: string = this.fiForm.get("aba").value;
    const FINamePresent: string = this.fiForm.get("fiName").value;
    const MainFrameFIDPresent: string = this.fiForm.get("mainframeId").value;
    const addressPresent: string = this.fiForm.get("address").value;
    const citypresent: string = this.fiForm.get("city").value;
    const statePresent: string = this.fiForm.get("state").value;
    const zipPresent: string = this.fiForm.get("zip").value;

    return (
      abaNumberPresent &&
      abaNumberPresent.length >= 1 &&
      FINamePresent &&
      FINamePresent.length >= 1 &&
      MainFrameFIDPresent &&
      MainFrameFIDPresent.length >= 1 &&
      addressPresent &&
      addressPresent.length >= 1 &&
      addressPresent.length <= 24 &&
      citypresent &&
      citypresent.length >= 1 &&
      citypresent.length <= 18 &&
      statePresent &&
      statePresent.length === 2 &&
      zipPresent &&
      zipPresent.length >= 1
    );
  }
}
