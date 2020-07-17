import { ValidateSecurityAnswerRequest } from './../../../../models/validatesecurityanswer';
import { Component, OnInit, Input, ViewChildren, QueryList, AfterViewInit, OnDestroy } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormArray
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import {
  DialogService,
  FiService,
  LoggingService,
  ProductService,
  SessionService,
  VaultService
} from "@app/services";
import { LocalModalComponent } from "@shared/components";
import {
  BinContext,
  FiContext,
  FiLiveStatus,
  IConfigItem
} from "@entities/models";
import { CONSTANTS } from "@entities/constants";
import { PRODUCT_IDS } from "@entities/product-ids";
import { DialogConfig, DialogTypes } from "@entities/dialog";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { UserContext } from "@entities/user-context";
import { APP_KEYS } from "@entities/app-keys";
import * as moment from "moment";
import * as _ from "lodash";
import Swal from "sweetalert2";
import { Subscription } from "rxjs";

@Component({
  selector: "fi-onboarding",
  templateUrl: "./fi-onboarding.html",
  styleUrls: ["./fi-onboarding.scss"]
})
export class FiOnboardingPage implements OnInit, AfterViewInit,OnDestroy  {
  fiiList: any = [];
  cols: any[] = [];
  colsFi: any[] = [];
  expandedRows: any[] = [];
  protected readonly CLASSNAME = "FiOnboardingPage";
  goLiveState = false;
  liveStatus = "Go Live";
  isProductConfig = false;
  goingLiveChange = false;
  public goLiveComment: string;
  userContext: UserContext = null;

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
  public readonly MAX_KV_LENGTH = 50;

  @ViewChildren('selectModal') selectModalQuery: QueryList<LocalModalComponent>;
  selectModalSubscription: Subscription;  
  selectModal: LocalModalComponent;

  @ViewChildren('fiModal') fiModalQuery: QueryList<LocalModalComponent>;
  fiModalSubscription: Subscription;  
  fiModal: LocalModalComponent;

  @ViewChildren('fiModalMain') fiModalMainQuery: QueryList<LocalModalComponent>;
  fiModalMainSubscription: Subscription;  
  fiModalMain: LocalModalComponent;

  @ViewChildren('goLivefiModal') goLivefiModalQuery: QueryList<LocalModalComponent>;
  goLivefiModalSubscription: Subscription;  
  goLivefiModal: LocalModalComponent;

  @ViewChildren('yesNoModal') yesNoModalQuery: QueryList<LocalModalComponent>;
  yesNoModalSubscription: Subscription;  
  yesNoModal: LocalModalComponent;

  public loading = false;
  public saving = false;
  public fiList: FiContext[] = [];
  public fiLiveStatus: FiLiveStatus[] = [];
  public productFiIDs: number[] = [];
  public productFiList: FiContext[] = [];
  public fiSelectList: FiContext[] = [];
  fiListGridList: any = [];
  public searchText = "";
  public filterText = "";

  public fiEditing: FiContext = null;
  public fiConfigs: IConfigItem[] = [];
  public cfgAddForm: FormGroup;
  public cfgEditForm: FormGroup;
  public SelectedValue: number = 0;
  public IsTouched: boolean = false;
  public Config_Value_Option: FormArray;
  ConfigValueOptions = [];
  public ResetFilterboxForm: FormGroup;
  isDisabled = false;
  KeyD: boolean = false;
  TypeD: boolean = false;
  SearchForm: FormGroup;
  SearchForm1: FormGroup;
  @Input() productId;
  Heading: string;
  ListValues: any = [];
  newListValues: any = {};
  isOnboardNewFIAllowed = false;
  canGoLive: boolean;
  makeenable: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _fiSvc: FiService,
    private _prodSvc: ProductService,
    private _dialogSvc: DialogService,
    private _toastr: ToastrService,
    private _log: LoggingService,
    private _tSwitch: MatSlideToggleModule,
    private _valutService: VaultService,
    private _sessionSvc: SessionService
  ) {}

  ngOnInit() {
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
      { field: "zip4", header: "Extended Zip" }
    ];
    this.colsFi = [
      { field: "aba", header: "ABA Number" },
      { field: "fiName", header: "Name" },
      { field: "pscuClientId", header: "PSCU Client ID" },
      { field: "mainframeId", header: "Mainframe FIID" }
    ];
    this.goLiveComment = "";
    this._getGridData();
    this.userContext = this._sessionSvc.get(APP_KEYS.userContext);
    if (this.userContext != null) {
      if (
        this.userContext.isSysAdmin ||
        (this.userContext.isJHAUser &&
          this._prodSvc.isRoleAdmin(this.productId))
      ) {
        this.isOnboardNewFIAllowed = true;
      }
    }

    this.SearchForm = this._fb.group({});  
    this.SearchForm1 = this._fb.group({});
    const productList = this._valutService.get(APP_KEYS.userContext);
    if (productList != null) {
      productList.assginedProducts.forEach(prod => {
        if (prod.productId === this.productId) {
          this.Heading = prod.productName;
        }
      });
    }

    this.newListValues = { Config_Value_Option: "" };
    this.ListValues.push(this.newListValues);
  }
  createItem(): FormGroup {
    return this._fb.group({
      value: "",
      Config_Value_Option: ""
    });
  }

  ngAfterViewInit() {
    this.selectModalSubscription = this.selectModalQuery.changes.subscribe(
      (selectQuery: QueryList<LocalModalComponent>) => {
        this.selectModal = selectQuery.first;
        this.selectModalSubscription.unsubscribe();
      }
    );
   
    this.fiModalSubscription = this.fiModalQuery.changes.subscribe(
      (fiQuery: QueryList<LocalModalComponent>) => {
        this.fiModal = fiQuery.first;
        this.fiModalSubscription.unsubscribe();
      }
    );
   
    this.fiModalMainSubscription = this.fiModalMainQuery.changes.subscribe(
      (fiMainQuery: QueryList<LocalModalComponent>) => {
        this.fiModalMain = fiMainQuery.first;
        this.fiModalMainSubscription.unsubscribe();
      }
    );
   
    this.goLivefiModalSubscription = this.goLivefiModalQuery.changes.subscribe(
      (goLiveQuery: QueryList<LocalModalComponent>) => {
        this.goLivefiModal = goLiveQuery.first;
        this.goLivefiModalSubscription.unsubscribe();
      }
    );

 
    //
    this.yesNoModalSubscription = this.yesNoModalQuery.changes.subscribe(
      (yesNoQuery: QueryList<LocalModalComponent>) => {
        this.yesNoModal = yesNoQuery.first;
        this.yesNoModalSubscription.unsubscribe();
      }
    );

  }
  ngOnDestroy() {
    this.selectModalSubscription.unsubscribe();
    this.fiModalSubscription.unsubscribe();
    this.fiModalMainSubscription.unsubscribe();
    this.goLivefiModalSubscription.unsubscribe();
  }

  public RefreshFilterboxGrid(datatable) {
    this.onSearch("", datatable);
  }

  ngLoad() {
    this._getGridData();
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

  public onFiAddClick = ($event: any) => {
    // this._log.debug(`${this.CLASSNAME} > onFiCreateClick()`);

    if (this.selectModal.isOpen || this.fiModal.isOpen) return;

    // if (this.selectGrid) {
    this._setFiAddGridData();
    this.selectModal.open();
    // }
  };

  public onFiEditClick = (data: any) => {
    // this._log.debug(`${this.CLASSNAME} > onFiEditClick()`);

    this._editFi(data.data.fiId);
  };

  public onFiDeleteClick = (data: any, node: any) => {
    this._log.debug(`${this.CLASSNAME} > onFiDeleteClick()`);

    var msg = CONSTANTS.genericCRUDMsgs.deleteConfirm;

    this._prodSvc
      .retrieveFILiveStatus(this.productId, data.data.fiId)
      .subscribe(resp => {
        if (resp.data) {
          this.goLiveState = resp.data.isEnabled;
          if (this.goLiveState === true) {           
          (Swal as any)
            .fire({
              title: CONSTANTS.sharedComponentMsgs.fiOnboarding.itemLiveConfirm,
              showCancelButton: false,
              confirmButtonColor: "#3085d6",
              type: "warning",
              cancelButtonColor: "#d33",
              confirmButtonText: "OK",
            })
            .then(result => {
              if (result.value) {
               // this._toastr.warning("FI is live, FI association with product cannot be deleted")
               
              }
            });
          return;
        }
        else{
          (Swal as any)
          .fire({
            title: "Confirm to delete",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            type: "warning",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
          })
          .then(result => {
            if (result.value) {
               this._prodSvc
                .offBoardFiProduct(this.productId, data.data.fiId)
                .subscribe(response => {
                  this._log.debug(
                    `${this.CLASSNAME} > _prodSvc.offBoardFiProduct() > response.data: `,
                    response.data
                  );
                  this.productFiIDs = response.data ? response.data : [];
                  this._filterFiLists();
                  this._toastr.success(
                    CONSTANTS.sharedComponentMsgs.fiOnboarding.fiDeleteSuccess
                  );
                });
            }
          });
        }
       
        } else {
          (Swal as any)
            .fire({
              title: msg,
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              type: "warning",
              confirmButtonText: "Yes",
              cancelButtonText: "No"
            })
            .then(result => {
              if (result.value) {
                this._prodSvc
                  .offBoardFiProduct(this.productId, data.data.fiId)
                  .subscribe(response => {
                    if (response.data && response.data.length) {
                      this._log.debug(
                        `${this.CLASSNAME} > _prodSvc.offBoardFiProduct() > response.data: `,
                        response.data
                      );
                      this.productFiIDs = response.data;
                      this._filterFiLists();
                    }
                  });
              }
            });
        }
      });
  };

  // FI Selection Modal

  public onFiAddSearch(searchText: string, fidatatable: any): void {
    
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(() => {
      if (fidatatable) {
        fidatatable.filterGlobal(searchText, "contains");
      }
    }, 250);
    if (fidatatable) {
      fidatatable.filterGlobal(searchText,  "contains");
    }
    searchText = searchText.toUpperCase();
  }

  public RefreshFiFilterboxGrid(fidatatable) {  
    this.onFiAddSearch("", fidatatable);
  }

  public onFiSelectClick = (data: any, node: any) => {
    this._prodSvc.onBoardFiProduct(this.productId, data.data.fiId).subscribe(
      response => {
        if (response.errorMessages && response.errorMessages.length) {
          response.errorMessages.forEach((msg: string) => {
            this._toastr.error(msg);
          });
          return;
        }

        this.selectModal.close();

        if (response.data && response.data.length) {
          this._log.debug(
            `${this.CLASSNAME} > _prodSvc.onBoardFiProduct() > response.data: `,
            response.data
          );
          this.productFiIDs = response.data;
          this._filterFiLists();
          this._editFi(data.data.fiId);
        }

        this._toastr.success(
          CONSTANTS.sharedComponentMsgs.fiOnboarding.fiAddSuccess
        );
        this._setFiAddGridData([]);
      },
      err => {
        this.selectModal.close();
        this._toastr.error(
          CONSTANTS.sharedComponentMsgs.fiOnboarding.fiOnboardFailed
        );
      },
      () => {
        this.saving = false;
      }
    );
  };

  public onSelectCancelClick = () => {
    this.selectModal.close();
    this._setFiAddGridData([]);
  };

  // FI Config Modal

  public onFiEditCloseClick = (data: any, node: any) => {
    this.goingLiveChange = false;
    this._closeFiEdit();
  };

  public onGoLiveEditClose(env) {
    this.goLiveState = this.goLiveState === true ? false : true;
    this.liveStatus = this.goLiveState === true ? "Live" : "Go Live";
    this.goLivefiModal.close();
    this.makeenable == false;
  }

  public onCommentEntry(env) {
    this.makeenable = false;
    const itm: string = env.target.value;
    this.goingLiveChange = itm.length > 20;
    if (itm.length > 20){
      this.makeenable = true;
    }
  }

  public onConfirmGoLiveChange(env) {
    this.canGoLive = false;
    this.yesNoModal.close();    
    this.makeenable = false;

///only for card maint
    if(this.productId == 2){
    if (!this.mandatoryFieldsPresent()) {  

      const msg = (this.goLiveState === true) ?  CONSTANTS.sharedComponentMsgs.fiOnboarding.invalidGoLiveMandatoryFields: "";
      (Swal as any).fire({
        title: msg,
        type: 'warning',
        allowOutsideClick: false,
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ok'
      }).then((result) => {
        if (result.value) {
          this.goLiveState  = (this.goLiveState === true ) ? false : true;
        }        
      });
      return;
    }
  }
    
    if (!this.mandatoryFIConfigsPresent()) {  
    
      const msg1 = (this.goLiveState === true) ?  CONSTANTS.sharedComponentMsgs.fiOnboarding.invalidGoliveConfigurationvalues: "";
      (Swal as any).fire({
        title: msg1,
        type: 'warning',
        allowOutsideClick: false,
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ok'
      }).then((result) => {
        if (result.value) {
          this.goLiveState  = (this.goLiveState === true ) ? false : true;
          this.canGoLive===false;
        }        
      });
      return;
    }
    else{
      this.canGoLive = true
      if (!this.goLivefiModal.isOpen && this.canGoLive===true) {
        this.goLivefiModal.open();  
        this.makeenable == false;    
     
      }
    }

  

    //this.goLivefiModal.open();
    // this.canGoLive = true;
    // this.yesNoModal.close();
    // this.goLivefiModal.open();
  }

  public onDenyGoLiveChange(env) {
    this.canGoLive = false;
    this.goLiveState = this.goLiveState === true ? false : true;
    this.liveStatus = this.goLiveState === true ? "Live" : "Go Live";
    this.yesNoModal.close();
  }

  public onCommentSave(env) {
    if (this.goLiveComment.length < 20) {
      this._toastr.warning(
        CONSTANTS.sharedComponentMsgs.fiOnboarding.fiOnboardComment
      );
      return;
    }

    this._prodSvc
      .addUpdateFIProductMapping(
        this.productId,
        this.fiEditing.fiId,
        this.goLiveState,
        this.goLiveComment,
        this.userContext.username
      )
      .subscribe(resp => {
        // if (resp && resp.length) {
        if (resp === null) {
          // this._log.debug(`${this.CLASSNAME} > _prodSvc.addUpdateFIProductMapping() > response.data: `, resp);
          this.goLiveState = this.goLiveState === true ? false : true;
          this.liveStatus = this.goLiveState === true ? "Live" : "Go Live";
          // this._toastr.success('Status has been changed to ' + this.liveStatus);
        }
        this.displayShowLiveChangedMessage(resp);
      });

    this.goLivefiModal.close();
    this.makeenable == false;
  }

  // Config Add/Edit

  public onCfgAddClick() {
    this.cfgEditForm = null;
    this.isDisabled = false;
    this.cfgAddForm = this._fb.group({
      dataType: new FormControl("", Validators.required),
      key: new FormControl("", Validators.required),
      value: new FormControl(""),
      isRequired: new FormControl(""),
      Config_Value_Option: this._fb.array([this.createItem()])
    });
  }

  public onCfgEditClick(configId: number) {
    this.ConfigValueOptions = [];
    this.isDisabled = true;
    this.cfgEditForm = null;
    this.cfgAddForm = null;
    let config = this.fiConfigs.find((cfg: IConfigItem) => {
      return cfg.configId === configId;
    });
    // console.log(config);
    this.isProductConfig = config.isProductConfig;
    if (config) {
      this.cfgEditForm = this._fb.group({
        configId: new FormControl(config.configId),
        dataType: new FormControl(config.dataType, Validators.required),
        key: new FormControl(config.key, Validators.required),
        value: new FormControl(config.value),
        isRequired: new FormControl({
          value: config.isRequired,
          disabled: "disabled"
        }),
        Config_Value_Option: this._fb.array([this.createItem()])
      });
      if (config.dataType == "List") {
        this.Config_Value_Option = this.cfgEditForm.get(
          "Config_Value_Option"
        ) as FormArray;
        this.Config_Value_Option.removeAt(0);
        if (config.config_Value_Option) {
          // console.log(config.config_Value_Option.split(","));
          let i = 0;
          config.config_Value_Option.split(",").forEach(vl => {
            if (vl == config.value) {
              this.SelectedValue = i;
              let formG: FormGroup = this._fb.group({
                value: i,
                Config_Value_Option: vl
              });
              this.Config_Value_Option = this.cfgEditForm.get(
                "Config_Value_Option"
              ) as FormArray;
              this.Config_Value_Option.push(formG);
            } else {
              let formG: FormGroup = this._fb.group({
                value: "",
                Config_Value_Option: vl
              });
              this.Config_Value_Option = this.cfgEditForm.get(
                "Config_Value_Option"
              ) as FormArray;
              this.Config_Value_Option.push(formG);
            }
            this.ConfigValueOptions.push({
              value: i,
              Config_Value_Option: vl
            });
            i = i + 1;
          });
          if (this.isProductConfig) {
            this.cfgEditForm.controls["value"].setValue(this.SelectedValue);
          }
        }
      }

      // console.log(this.cfgEditForm.value);
      this._log.debug(
        `${this.CLASSNAME} > onFiSaveClick() > data.value`,
        config.value
      );
    }
  }

  public onCfgSaveClick = () => {
    const data = this._getValidCfgFormModel();
    if (!data) return;

    // if (this.IsTouched === false && data.dataType === 'List') {
    //   this._toastr.error(CONSTANTS.genericCRUDMsgs.saveEditConfirm);
    //   //sharedComponentMsgs.fiOnBoarding.invalidConfigValue;
    //   return;
    // }

    const config: any = {
      configId: data.configId || 0,
      categoryId: this.productId,
      entityId: this.fiEditing.fiId,
      key: data.key,
      value: data.value,
      dataType: data.dataType,
      isProductConfig: false,
      isRequired: data.isRequired === true ? true : false,
      config_Value_Option: data.Config_Value_Option
    };
    if (this.KeyD && !config.configId) {
      this._toastr.error(
        CONSTANTS.sharedComponentMsgs.configParameters.invalidConfigKey
      );
      return false;
    }
    if (data.dataType === 'List') {
      config.value =
        config.config_Value_Option[this.SelectedValue].Config_Value_Option;
      let cvo = '';
      config.config_Value_Option.forEach(element => {
        cvo += element.Config_Value_Option + ',';
      });
      cvo = cvo.replace(/,\s*$/, '');
      config.config_Value_Option = cvo;
    } else {
      config.config_Value_Option = '';
    }
    // console.log(config);
    this._log.debug(`${this.CLASSNAME} > onCfgSaveClick() > config: `, config);
    this.saving = true;
    this._prodSvc.saveConfig(config).subscribe(
      response => {
        if (response.errorMessages && response.errorMessages.length) {
          response.errorMessages.forEach((msg: string) => {
            this._toastr.error(msg);
          });
          return;
        }

        if (response.data && response.data.length) {
          this.fiConfigs = response.data;
        }

        this.cfgAddForm = null;
        this.cfgEditForm = null;
        this.saving = false;
        this._toastr.success(CONSTANTS.genericCRUDMsgs.saveSuccess);
      },
      err => {
        this.saving = false;
        this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
      },
      () => {
        this.saving = false;
        this.IsTouched = false;
      }
    );
  };

  public onCfgCancelClick = () => {
    // this._log.debug(`${this.CLASSNAME} > onProdFiCancelClick()`);

    this.cfgAddForm = null;
    this.cfgEditForm = null;
    this.IsTouched = false;
  };

  public onCfgDeleteClick = (configId: number) => {
    this._log.debug(`${this.CLASSNAME} > onFiDeleteClick()`);

    (Swal as any)
      .fire({
        title: CONSTANTS.genericCRUDMsgs.deleteConfirm,
        showCancelButton: true,
        type: "warning",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this._prodSvc.deleteConfig(configId).subscribe(
            response => {
              if (response.errorMessages && response.errorMessages.length) {
                response.errorMessages.forEach((msg: string) => {
                  this._toastr.error(msg);
                });
                return;
              }

              const index = this.fiConfigs.findIndex((cfg: IConfigItem) => {
                return cfg.configId === configId;
              });

              if (index >= 0) this.fiConfigs.splice(index, 1);

              this._toastr.success(
                CONSTANTS.sharedComponentMsgs.sucessitemDelete
              );
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

  private _getGridData() {
    this.loading = true;
    this._fiSvc.getFIs().subscribe(
      response => {
        if (response.errorMessages && response.errorMessages.length) {
          response.errorMessages.forEach((msg: string) => {
            this._toastr.error(msg);
          });
          return;
        }

        // this._log.debug(`${this.CLASSNAME} > _fiSvc.getFIs() > response.data: `, response.data);

        this.fiList = this._evalFIs(response.data || []);
        const sorted: FiContext[] = this.fiList.sort((A, B) => {
          if (A.fiId > B.fiId) {
            return 1;
          }
          if (A.fiId < B.fiId) {
            return -1;
          }
        });

        this.fiList = sorted;

        this._filterFiLists();

        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
      }
    );

    this._prodSvc.getProductFIs(this.productId).subscribe(
      response => {
        if (response.errorMessages && response.errorMessages.length) {
          response.errorMessages.forEach((msg: string) => {
            this._toastr.error(msg);
          });
          return;
        }

        // this._log.debug(`${this.CLASSNAME} > _prodSvc.getProductFIs() > response.data: `, response.data);

        if (response.data && response.data.length) {
          this._log.debug(
            `${this.CLASSNAME} > _prodSvc.getProductFIs() > response.data: `,
            response.data
          );
          this.productFiIDs = response.data;
          const sortedProducts: number[] = this.productFiIDs.sort(
            (A, B) => A - B
          );
          this.productFiIDs = sortedProducts;
          this._filterFiLists();
        }

        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
      }
    );
  }

  private _editFi(fiId: number) {
    this._prodSvc.getFiConfigs(this.productId, fiId).subscribe(
      response => {
        if (response.errorMessages && response.errorMessages.length) {
          response.errorMessages.forEach((msg: string) => {
            this._toastr.error(msg);
          });
          return;
        }

        this.fiConfigs = response.data || [];

        this._prodSvc
          .retrieveFILiveStatus(this.productId, this.fiEditing.fiId)
          .subscribe(resp => {
            if (resp.data) {
              this.goLiveState = resp.data.isEnabled;
              this.liveStatus = this.goLiveState === true ? "Live" : "Go Live";
            }
          });
        // console.log('Response:::' + JSON.stringify(resp));
        this.liveStatus = this.goLiveState === true ? "Live" : "Go Live";

        // this.fiConfigs = response.data || [];
        this.fiModal.open();
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
      }
    );

    this.fiEditing = this.fiList.find((fi: FiContext) => {
      return fi.fiId === fiId;
    });
  }

  private _getValidCfgFormModel() {
    const data = this.cfgAddForm
      ? this.cfgAddForm.getRawValue()
      : this.cfgEditForm
      ? this.cfgEditForm.getRawValue()
      : null;

    if (this.cfgEditForm) {
      const config = this.fiConfigs.find((cfg: IConfigItem) => {
        return cfg.configId === data.configId;
      });

      if (!data || !data.configId) {
        this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
        return null;
      }

      data.configId = config.configId;
      data.dataType = config.dataType;
      data.key = config.key;
    }

    if (!data.dataType) {
      this._toastr.error(
        CONSTANTS.sharedComponentMsgs.fiOnboarding.invalidDataType
      );
      return null;
    }

    if (!data.key) {
      this._toastr.error(
        CONSTANTS.sharedComponentMsgs.fiOnboarding.invalidConfigKey
      );
      return null;
    }

    switch (data.dataType) {
      case "Datetime":
        if(data.value===null || data.value===''){
          data.value=  moment(new Date(), "DD/MM/YYYY");
      }
        if (!data.value.isValid()) {
          this._toastr.error(
            CONSTANTS.sharedComponentMsgs.fiOnboarding.invalidDate
          );
          return null;
        } else
        { 
          data.value = data.value.format("L"); 
        }

        break;

      case "Number":
        if (data.value === null || isNaN(data.value)) {
          this._toastr.error(
            CONSTANTS.sharedComponentMsgs.fiOnboarding.invalidConfigNumber
          );
          return null;
        } else data.value = data.value.toString();

        break;

      case "Boolean":
        data.value = (!!data.value).toString();
        break;

      default:
        if (!data.value && data.dataType == "String") {
          this._toastr.error(
            CONSTANTS.sharedComponentMsgs.fiOnboarding.invalidConfigValue
          );
          return null;
        }
        break;
    }

    if (data.value.length > this.MAX_KV_LENGTH) {
      this._toastr.error(
        `Value is too long.  Please enter a value shorter than ${this.MAX_KV_LENGTH} characters.`
      );
      return null;
    }

    return data;
  }

  private _filterFiLists() {
    if (this.fiList && this.fiList.length && this.productFiIDs) {
      this._log.debug(`${this.CLASSNAME} > _filterFiLists()`);

      this.productFiList = this.fiList.filter((fi: FiContext) => {
        return this.productFiIDs.indexOf(fi.fiId) >= 0;
      });
      this.fiSelectList = this.fiList.filter((fi: FiContext) => {
        return this.productFiIDs.indexOf(fi.fiId) < 0;
      });
    } else {
      this.productFiList = [];
      this.fiSelectList = [];
    }
  }

  private _setFiAddGridData(items?: FiContext[]) {
    this.fiListGridList = items || this.fiSelectList || [];
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

  private _closeFiEdit() {
    this.fiModal.close();
    this.fiEditing = null;
    this.cfgAddForm = null;
    this.cfgEditForm = null;
  }

  onToggle(env) {
    this.goingLiveChange = false;
    this.goLiveComment = "";
     //Add Yes No Dialog
    
    if(!this.yesNoModal.isOpen) {
      this.yesNoModal.open();
      return;
    }


    // if (!this.goLivefiModal.isOpen && this.canGoLive===true) {
    //   this.goLivefiModal.open();
    //   // this._dialogSvc.show(this.goLivefiModal);
    // }
  }

  displayShowLiveChangedMessage(data) {
    this._toastr.success(
      CONSTANTS.sharedComponentMsgs.fiOnboarding.fiStateChange
    );
  }

  private mandatoryFieldsPresent(): boolean {
    const abaNumberPresent: string = this.fiEditing.aba;
    const FINamePresent: string = this.fiEditing.fiName; //this.fiModal.get('fiName').value;
    const MainFrameFIDPresent: string = this.fiEditing.mainframeId; //this.fiModal.get('mainframeId').value;
    const PSCUClientIDPresent: string = this.fiEditing.pscuClientId; // this.fiModal.get('pscuClientId').value;
    const addressPresent: string = this.fiEditing.address; // this.fiModal.get('address').value;
    const citypresent: string = this.fiEditing.city; // this.fiModal.get('city').value;
    const statePresent: string = this.fiEditing.state; // this.fiModal.get('state').value;
    const zipPresent: string = this.fiEditing.zip; // this.fiModal.get('zip').value;
let status =  (abaNumberPresent &&
              abaNumberPresent.length >= 1 &&
              FINamePresent &&
              FINamePresent.length >= 1 &&
              MainFrameFIDPresent &&
              MainFrameFIDPresent.length >= 1 &&
              PSCUClientIDPresent &&
              PSCUClientIDPresent.length >= 1 &&
              addressPresent &&
              addressPresent.length >= 1 && addressPresent.length <= 24 &&
              citypresent &&
              citypresent.length >= 1 && citypresent.length <= 18 &&
              statePresent.length === 2 &&
              zipPresent.length >= 1);
    if (status = '' || status == null)  {
      status= false
    }
    else{ status = true}
    return status;
  }

  private mandatoryFIConfigsPresent(): boolean {
    let status = true;
    
    this.fiConfigs.forEach( item => {
      if(item.isRequired === true && item.value === '') {
        status = false;
      }
    });

    return status;
  }
  public addListValue() {
    if (this.cfgAddForm) {
      this.Config_Value_Option = this.cfgAddForm.get(
        "Config_Value_Option"
      ) as FormArray;
      this.Config_Value_Option.push(this.createItem());
    } else {
      this.Config_Value_Option = this.cfgEditForm.get(
        "Config_Value_Option"
      ) as FormArray;
      this.Config_Value_Option.push(this.createItem());
    }
  }
  public removeListValue(index) {
    if (this.cfgAddForm) {
      this.Config_Value_Option = this.cfgAddForm.get(
        "Config_Value_Option"
      ) as FormArray;
      this.Config_Value_Option.removeAt(index);
    } else {
      this.Config_Value_Option = this.cfgEditForm.get(
        "Config_Value_Option"
      ) as FormArray;
      this.Config_Value_Option.removeAt(index);
    }
  }
  public SelectListValue(index) {
    this.IsTouched = true;
    this.SelectedValue = index;
    // console.log(this.SelectedValue);
  }
  public ChangeListValue(event) {
    let val = event.target.value;
    this.IsTouched = ( this.SelectedValue !== val);
    this.SelectedValue = val;
  }
  public CheckDuplicateKey(event) {
    this.KeyD = false;
    this.IsTouched = true;
    let value = event.target.value;
    var filteredArray = this.fiConfigs.filter(function(itm) {
      return value === itm.key;
    });
    if (filteredArray.length > 0) {
      this.KeyD = true;
      this.IsTouched = true;
      this._toastr.error("Config Parameter key is already available.");
    }
  }
}
