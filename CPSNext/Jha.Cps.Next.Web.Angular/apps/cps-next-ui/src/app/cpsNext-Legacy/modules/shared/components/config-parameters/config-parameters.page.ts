import {
  Component,
  Input,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import {
  LoggingService,
  FiService,
  ProductService,
  DialogService,
  SessionService,
  VaultService
} from "@app/services";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import * as _ from "lodash";
import { LocalModalComponent } from "@app/modules/shared/components";
import { IConfigItem, IConfigItemBackend } from "@app/entities/models";
import { PRODUCT_IDS } from "@app/entities/product-ids";
import { UserContext } from "@app/entities/user-context";
import { APP_KEYS } from "@app/entities/app-keys";
import { DialogConfig, DialogTypes } from "@app/entities/dialog";
import { CONSTANTS } from "@app/entities/constants";
import Swal from "sweetalert2";
import * as moment from "moment";
import { Subscription } from "rxjs";

@Component({
  selector: "configParameters",
  templateUrl: "./config-parameters.html",
  styleUrls: ["./config-parameters.scss"]
})
export class ConfigParametersPage implements AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = "ConfigParametersPage";
  public ResetFilterboxForm: FormGroup;
  public filterText: string;
  public items: IConfigItemBackend[] = [];
  public loading: false;
  public cfgForm: FormGroup;
  public Config_Value_Option: FormArray;
  public saving: boolean;
  public SelectedValue: number = 0;

  public readonly DATA_TYPES = [
    {
      key: "List",
      value: "List"
    },
    {
      key: "String",
      value: "String"
    },
    {
      key: "Number",
      value: "Number"
    },
    {
      key: "DateTime",
      value: "Datetime"
    },
    {
      key: "Boolean",
      value: "Boolean"
    }
  ];

  // ListValues:any = [{
  //   'Config_Value_Option': ''
  // }];
  // Listvcount = 1;

  ListValues: any = [];
  newListValues: any = {};
  cols: any[] = [];

  public readonly MAX_KV_LENGTH = 50;
  public _userDetails: UserContext = this._sessionSvc.get(APP_KEYS.userContext);

  @ViewChildren("configModal") configModalQuery: QueryList<LocalModalComponent>;
  configModalSubscription: Subscription;
  configModal: LocalModalComponent;

  isDisabled = false;
  KeyD: boolean = false;
  TypeD: boolean = false;
  @Input() productId;
  public Heading: string;
  SearchForm: FormGroup;
  constructor(
    private _fb: FormBuilder,
    private _fiSvc: FiService,
    private _prodSvc: ProductService,
    private _dialogSvc: DialogService,
    private _toastr: ToastrService,
    private _log: LoggingService,
    private _sessionSvc: SessionService,
    private _valutService: VaultService,
    private _tSwitch: MatSlideToggleModule
  ) {}

  ngOnInit() {
    this.cols = [
      { field: "Config_Key", header: "Key" },
      { field: "DataType", header: "Data Type" },
      { field: "Config_Value", header: "Value" },
      { field: "IsRequired", header: "Required" }
    ];
    this.getGridData();
    this._buildForm();
    this.newListValues = { Config_Value_Option: "" };
    this.ListValues.push(this.newListValues);
    let productList = this._valutService.get(APP_KEYS.userContext);
    if (productList != null) {
      productList.assginedProducts.forEach(prod => {
        if (prod.productId == this.productId) {
          this.Heading = prod.productName;
        }
      });
    }
    this.SearchForm = this._fb.group({
      // searchService: new FormControl(''),
    });
  }
  createItem(): FormGroup {
    return this._fb.group({
      Config_Value: "",
      Config_Value_Option: ""
    });
  }

  ngAfterViewInit() {
    this.configModalSubscription = this.configModalQuery.changes.subscribe(
      (configQuery: QueryList<LocalModalComponent>) => {
        this.configModal = configQuery.first;
        this.configModalSubscription.unsubscribe();
      }
    );
  }
  ngOnDestroy() {
    this.configModalSubscription.unsubscribe();
  }
  // private _initGridConfig() {
  //   this.gridOptions = _.merge(<IGridOptions>{}, this._agSvc.defaultOptions);
  //   this.gridOptions.idField = 'PCID';
  //   this.gridOptions.columns = <IGridColumn[]>[
  //     {
  //       headerName: 'Key',
  //       field: 'Config_Key',
  //       width:  60,
  //     },
  //     {
  //       headerName: 'Data Type',
  //       field: 'DataType',
  //       width:  30,
  //     },
  //     {
  //       headerName: 'Value',
  //       field: 'Config_Value',
  //     },
  //     {
  //       headerName: 'Required ',
  //       field: 'IsRequired',
  //       cellRenderer: 'agCheckboxRenderer',
  //       width:  20,
  //     },
  //     {
  //       tooltip: () => {
  //         return 'Actions';
  //       },
  //       cellClass: ['ag-cell-actions'],
  //       cellRenderer: 'agActionsRenderer',
  //       cellRendererParams: {
  //         items: [
  //           <IGridActionItem>{
  //             type: 'anchor',
  //             classes: 'button-image btn-edit',
  //             onClick: this.onConfigParamClick.bind(this)
  //           },
  //           <IGridActionItem>{
  //             type: 'anchor',
  //             classes: 'button-image btn-delete',
  //             onClick: this.onConfigParamDeleteClick.bind(this)
  //           }
  //         ]
  //       },
  //       width: 75,
  //       minWidth: 75,
  //       maxWidth: 75
  //     }
  //   ];
  // }

  public onSearchFormSubmit($event: any) {
    //this.lastSearchParams = null;
    //this.onGridFilter('');
    //this.formattedValue = '';
    //this.formattedValues = [];
    //this.formattedModal.close();
    //this.filterText = '';
    //this.items = [];
    //this._searchLogs();
  }

  filterTimeout = null;
  public onGridFilter(filterText: string, datatable: any): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(() => {
      if (datatable) {
        datatable.filter(filterText, "Config_Key");
      }
    }, 250);
    if (datatable) {
      datatable.filter(filterText, "Config_Key");
    }
    filterText = filterText.toUpperCase();
  }

  public RefreshFilterboxGrid(dataTable: any) {
    this.onGridFilter("", dataTable);
  }

  // public onGridFilter(filterText: string) {
  //   this.filterText = filterText.toUpperCase();
  //   this._filterSearchResults();
  // }

  public onConfigParamClick = (data: any, node: any) => {
    // console.log(data.data);
    this._buildForm();
    this.isDisabled = true;
    this.cfgForm.patchValue({
      PCID: data.data.PCID,
      DataType: data.data.DataType,
      Config_Key: data.data.Config_Key,
      Config_Value: data.data.Config_Value,
      IsRequired: data.data.IsRequired
    });

    if (data.data.DataType == "List") {
      this.Config_Value_Option = this.cfgForm.get(
        "Config_Value_Option"
      ) as FormArray;
      this.Config_Value_Option.removeAt(0);
      // console.log(data.data.Config_Value_Option.split(","));
      let i = 0;
      data.data.Config_Value_Option.split(",").forEach(vl => {
        if (vl == data.data.Config_Value) {
          this.SelectedValue = i;
          let formG: FormGroup = this._fb.group({
            Config_Value: i,
            Config_Value_Option: vl
          });
          this.Config_Value_Option = this.cfgForm.get(
            "Config_Value_Option"
          ) as FormArray;
          this.Config_Value_Option.push(formG);
        } else {
          let formG: FormGroup = this._fb.group({
            Config_Value: "",
            Config_Value_Option: vl
          });
          this.Config_Value_Option = this.cfgForm.get(
            "Config_Value_Option"
          ) as FormArray;
          this.Config_Value_Option.push(formG);
        }
        i = i + 1;
      });
    }
    // console.log(this.cfgForm.value);
    this.configModal.open();
  };

  public onConfigParamDeleteClick = (data: any) => {
    const pcId = data.data.PCID;

    (Swal as any)
      .fire({
        title: CONSTANTS.genericCRUDMsgs.deleteConfirm,
        // text: '<span> WARNING: All of the FI config param of this key will be deleted as well. <span>',
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        html:
          '<span style="color:red;"><b>WARNING : </b> All of the onboarded FIs config param for this key will be deleted as well. </span>',
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this._prodSvc.deleteProductConfig(pcId, this.productId).subscribe(
            response => {
              if (response.ErrorMessages && response.ErrorMessages.length) {
                response.ErrorMessages.forEach((msg: string) => {
                  this._toastr.error(msg);
                });
                return;
              }

              let index = this.items.findIndex((cfg: IConfigItemBackend) => {
                return cfg.PCID === pcId;
              });

              if (index >= 0) this.items.splice(index, 1);
              //this.grid.setRowData((this.items), false);
              this._toastr.success(CONSTANTS.genericCRUDMsgs.deleteSuccess);
            },
            err => {
              this._toastr.error(
                CONSTANTS.sharedComponentMsgs.faileditemDelete
              );
            }
          );
        }
      });
  };

  public onConfigParamAddClick() {
    this.isDisabled = false;
    this._buildForm();
    this.configModal.open();
    // if (this.configModal.isOpen)
    //   return;
    // if (this.grid) {
    //   this.configModal.open();
    // }
  }

  public changeDataType(event) {
    let value = event.target.value;
    if (value == "Datetime") {
      this.cfgForm.controls["Config_Value"].setValue(moment());
    }
  }

  private _buildForm() {
    this.cfgForm = this._fb.group({
      DataType: new FormControl("", Validators.required),
      Config_Key: new FormControl("", Validators.required),
      Config_Value: new FormControl(""),
      IsRequired: new FormControl(false),
      PCID: new FormControl(0),
      PrdID: new FormControl(this.productId),
      CreateBy: this._userDetails != null ? this._userDetails.username : "",
      Config_Value_Option: this._fb.array([this.createItem()])
    });
  }

  public onCfgCancelClick() {
    this.configModal.close();
  }

  public onCfgSaveClick() {
    const configFormValue = this.cfgForm.value;

    // console.log(this.cfgForm.value);
    if (this.cfgForm.valid) {
      if (this.KeyD && !configFormValue.PCID) {
        this._toastr.error(
          CONSTANTS.sharedComponentMsgs.configParameters.invalidConfigKey
        );
        return false;
      }
      if (this.cfgForm.value.DataType == "List") {
        configFormValue.Config_Value =
          configFormValue.Config_Value_Option[
            this.SelectedValue
          ].Config_Value_Option;
        let cvo = "";
        configFormValue.Config_Value_Option.forEach(element => {
          cvo += element.Config_Value_Option + ",";
        });
        cvo = cvo.replace(/,\s*$/, "");
        configFormValue.Config_Value_Option = cvo;
      } else {
        configFormValue.Config_Value_Option = "";
      }
      // console.log(configFormValue);
      this._prodSvc
        .saveUpdateConfigBackend(configFormValue)
        .subscribe(response => {
          if (configFormValue.PCID) {
            this._toastr.success(
              CONSTANTS.sharedComponentMsgs.configParameters.updateConfig
            );
          } else {
            this._toastr.success(
              CONSTANTS.sharedComponentMsgs.configParameters.addConfig
            );
          }
          this.configModal.close();
          this.getGridData();
        });
    } else {
      this._toastr.error(CONSTANTS.genericCRUDMsgs.invalidInputs);
    }
  }

  public getGridData() {
    const pcId = 0;
    this._prodSvc
      .getProductConfigParameter(this.productId, pcId)
      .subscribe(response => {
        if (response.ErrorMessages && response.ErrorMessages.length) {
          response.ErrorMessages.forEach((msg: string) => {
            this._toastr.error(msg);
          });
          return;
        }

        this.items = response.Data || [];
        // console.log(this.items);
        // this.grid.setRowData(this.items, false);
      });
  }

  public addListValue(index) {
    this.Config_Value_Option = this.cfgForm.get(
      "Config_Value_Option"
    ) as FormArray;
    this.Config_Value_Option.push(this.createItem());
  }
  public removeListValue(index) {
    this.Config_Value_Option = this.cfgForm.get(
      "Config_Value_Option"
    ) as FormArray;
    this.Config_Value_Option.removeAt(index);
  }
  public SelectListValue(index) {
    this.SelectedValue = index;
    //console.log(this.SelectedValue);
  }
  public CheckDuplicateKey(event) {
    this.KeyD = false;
    let value = event.target.value;
    var filteredArray = this.items.filter(function(itm) {
      return value === itm.Config_Key;
    });
    if (filteredArray.length > 0) {
      this.KeyD = true;
      this._toastr.error(
        CONSTANTS.sharedComponentMsgs.configParameters.invalidConfigKey
      );
    }
  }
}
