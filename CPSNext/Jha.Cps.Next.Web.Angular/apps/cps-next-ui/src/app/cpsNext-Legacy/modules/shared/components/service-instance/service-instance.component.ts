import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  AfterViewInit,
  ViewChildren,
  QueryList,
  OnDestroy
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { first } from "rxjs/operators";

import { ToastrService } from "ngx-toastr";
import { LocalModalComponent } from "@shared/components";
import * as _ from "lodash";
import {
  DialogService,
  AccountService,
  ProductService,
  LoggingService,
  SessionService,
  VaultService
} from "@app/services";
import {
  ServiceInstanceContext,
  ServiceHostContext,
  FiContext
} from "@entities/models";
import { CONSTANTS } from "@entities/constants";
import { UserContext } from "./../../../../entities/user-context";
import { APP_KEYS } from "@entities/app-keys";
import Swal from "sweetalert2";
import beautify from "xml-beautifier";
import { InputValidationService } from "@app/services";
import { TableModule, Table } from "primeng/table";
import { Subscription } from "rxjs";
//import { Table } from "primeng/components/table/table";
@Component({
  selector: "service-instance",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./service-instance.component.html",
  styleUrls: ["./service-instance.component.css"]
})
export class ServiceInstanceComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(Table) dataTableQuery: QueryList<Table>;
  @ViewChildren("rowDetailModal") detailModalQuery: QueryList<
    LocalModalComponent
  >;
  @ViewChildren("serviceInstanceModal") serviceInstanceModalQuery: QueryList<
    LocalModalComponent
  >;
  @ViewChildren("configfileXmlModal") configfileXmlModalQuery: QueryList<
    LocalModalComponent
  >;
  @ViewChildren("logfileXmlModal") logfileXmlModalQuery: QueryList<
    LocalModalComponent
  >;

  dataTableQuerySubscription: Subscription;
  detailModalQuerySubscription: Subscription;
  serviceInstanceModalQuerySubscription: Subscription;
  configfileXmlModalQuerySubscription: Subscription;
  logfileXmlModalQuerySubscription: Subscription;

  datatable1: Table;
  detailModal: LocalModalComponent;
  serviceInstanceModal: LocalModalComponent;
  configfileXmlModal: LocalModalComponent;
  logfileXmlModal: LocalModalComponent;

  //#region Fields
  public configfileXml = beautify(
    `<?xml version="1.0" encoding="UTF-8"?><breakfast_menu><food><name>Belgian Waffles</name><price>$5.95</price><description>Two of our famous Belgian Waffles with plenty of real maple syrup</description><calories>650</calories></food><food><name>Strawberry Belgian Waffles</name><price>$7.95</price><description>Light Belgian waffles covered with strawberries and whipped cream</description><calories>900</calories></food><food><name>Berry-Berry Belgian Waffles</name><price>$8.95</price><description>Light Belgian waffles covered with an assortment of fresh berries and whipped cream</description><calories>900</calories></food><food><name>French Toast</name><price>$4.50</price><description>Thick slices made from our homemade sourdough bread</description><calories>600</calories></food><food><name>Homestyle Breakfast</name><price>$6.95</price><description>Two eggs, bacon or sausage, toast, and our ever-popular hash browns</description><calories>950</calories></food></breakfast_menu>`
  );
  public logfileXml = beautify(
    `<?xml version="1.0" encoding="UTF-8"?><breakfast_menu><food><name>Belgian Waffles</name><price>$5.95</price><description>Two of our famous Belgian Waffles with plenty of real maple syrup</description><calories>650</calories></food><food><name>Strawberry Belgian Waffles</name><price>$7.95</price><description>Light Belgian waffles covered with strawberries and whipped cream</description><calories>900</calories></food><food><name>Berry-Berry Belgian Waffles</name><price>$8.95</price><description>Light Belgian waffles covered with an assortment of fresh berries and whipped cream</description><calories>900</calories></food><food><name>French Toast</name><price>$4.50</price><description>Thick slices made from our homemade sourdough bread</description><calories>600</calories></food><food><name>Homestyle Breakfast</name><price>$6.95</price><description>Two eggs, bacon or sausage, toast, and our ever-popular hash browns</description><calories>950</calories></food></breakfast_menu>`
  );

  public configfileXmlForm: FormGroup;
  public loading = false;
  public saving = false;
  public configfilexmlsaving = false;
  public serviceInstanceForm: FormGroup;
  public ResetFilterboxForm: FormGroup;
  @Input() productId;
  @Input() productCode;
  Heading;
  public ServiceInstanceEditing: ServiceInstanceContext = null;
  public instances: ServiceInstanceContext[] = [];
  public fiSelectList: FiContext[] = [];
  public fiList: FiContext[] = [];
  public loadingServicehostID = false;
  public ServiceHostList: ServiceHostContext[] = [];
  public StatusList: ServiceHostContext[] = [];
  public MessageTransformList: ServiceHostContext[] = [];
  public MessageSettingList: ServiceHostContext[] = [];
  public IsoSpecificationList: ServiceHostContext[] = [];
  public ServiceChannelTypeList: ServiceHostContext[] = [];
  public AppModuleList: ServiceHostContext[] = [];
  public ConfigTemplateList: ServiceHostContext[] = [];
  public ConfigLogTemplateList: ServiceHostContext[] = [];
  public loadingContainerConfigID = false;
  public selectedServiceHostID = 0;
  public selectedHostType = "";
  public _userDetails: UserContext = null;
  public childindex = 0;
  public invalidIPAddress = false;
  public invalidURL = false;
  public invalidURL2 = false;
  public invalidURL3 = false;
  public loadingFIDs = false;
  public InvalidExistingInstanceName = false;
  public invalidLogFilePath = false;
  public Reloadapptouched = false;
  FidropdownSettings = {};
  FiSelect: any = [];
  newfiselect: any = [];
  newfiSavelist: any = [];
  dropdownList = [];
  faSelected = [];
  fISelectedSave = [];
  PreviousFISelect: any = [];
  public selectedFIID = 0;
  public FISSelected: FiContext[] = [];
  public HighlightedFIS: FiContext[] = [];

  public selectedServiceConfigTemplateID = 0;
  public selectedServiceConfigTempType = "";

  public selectedLogConfigTemplateID = 0;
  public selectedLogConfigTempType = "";

  public selectedIsoID = 0;
  public selectIsoSpecification = "";
  public loadingIsoSpecficationID = false;

  public selectedServiceChannelType = 0;
  public selectedSvcChannelType = "";
  public loadingServiceChannelTypeID = false;

  public selectedStatus = 0;
  public selectedStatusType = "";
  public loadingStatusID = false;

  public selectedMessagingTransformType = 0;
  public selectedMsgTransType = "";
  public loadingMessagingTransformTypeID = false;

  public selectedMsgSettingFile = 0;
  public selectedMsgSettingType = "";
  public loadingMsgSettingFileID = false;

  public selectedApplicationModule = 0;
  public selectedApplicationModuleType = "";
  public loadingApplicationModuleID = false;
  public FINamesCount = 1;
  public IV: InputValidationService = new InputValidationService();
  EXPORTED_COLUMNS = [
    "Container Name",
    "Service Instance Name",
    "Installation Status",
    "Command",
    "Reload App File",
    "Tcp Channel Name",
    "Tcp Server IP",
    "Tcp Port",
    "Version"
  ];
  cols: any[] = [];
  //#endregion

  constructor(
    private _fb: FormBuilder,
    private _prodSvc: ProductService,
    private _accountSvc: AccountService,
    private _sessionSvc: SessionService,
    private _valutService: VaultService,
    private _toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cols = [
      { field: "", header: "", width: "5%" },
      { field: "Action", header: "Action", width: "6.2%" },
      { field: "ServiceHost", header: "Container Name", width: "8%" },
      { field: "ServiceInstanceID", header: "Service Instance Name", width: "9%"},
      { field: "Status", header: "Installation Status", width: "6%" },
      { field: "Command", header: "Command", width: "8%" },
      { field: "ReloadAppFile", header: "Reload App File", width: "8%" },
      { field: "TcpChannelName", header: "TCP Channel Name", width: "8%" },
      { field: "TcpServerIP", header: "TCP Server IP", width: "8%" },
      { field: "TcpPort", header: "TCP Port", width: "4%" },
      { field: "ServiceVersion", header: "Version", width: "4%" }
    ];

    this.setProductInfo();
    this._buildServiceInstanceForm();
    this._getProdFIIDs();

    this.retrieveServiceHosts();
    this.retrieveConfigTemplateData();
    this.retrieveDictionaryData("Status");
    this.retrieveDictionaryData("MessagingTransformType");
    this.retrieveDictionaryData("MessagingSettingFile");
    this.retrieveDictionaryData("IsoSpecification");
    this.retrieveDictionaryData("ApplicationModule");
    this.retrieveDictionaryData("ServiceChannelType");
    this.ResetFilterboxForm = this._fb.group({
      search: new FormControl("")
    });
    this.configfileXmlForm = this._fb.group({
      FileContent: new FormControl(this.configfileXml)
    });
    this.FidropdownSettings = {
      singleSelection: false,
      idField: "FIID",
      textField: "Name",
      allowSearchFilter: true
    };
    this._getGridData();
  }

  ngAfterViewInit() {
    this.dataTableQuerySubscription = this.dataTableQuery.changes.subscribe(
      (ql: QueryList<Table>) => {
        this.datatable1 = ql.first;
       // this.datatable1.reset();
        this.dataTableQuerySubscription.unsubscribe();
      }
    );

    this.detailModalQuerySubscription = this.detailModalQuery.changes.subscribe(
      (ql: QueryList<LocalModalComponent>) => {
        this.detailModal = ql.first;
        this.detailModalQuerySubscription.unsubscribe();
      }
    );

    this.serviceInstanceModalQuerySubscription = this.serviceInstanceModalQuery.changes.subscribe(
      (ql: QueryList<LocalModalComponent>) => {
        this.serviceInstanceModal = ql.first;
        this.serviceInstanceModalQuerySubscription.unsubscribe();
      }
    );

    this.configfileXmlModalQuerySubscription = this.configfileXmlModalQuery.changes.subscribe(
      (ql: QueryList<LocalModalComponent>) => {
        this.configfileXmlModal = ql.first;
        this.configfileXmlModalQuerySubscription.unsubscribe();
      }
    );

    this.logfileXmlModalQuerySubscription = this.logfileXmlModalQuery.changes.subscribe(
      (ql: QueryList<LocalModalComponent>) => {
        this.logfileXmlModal = ql.first;
        this.logfileXmlModalQuerySubscription.unsubscribe();
      }
    );
  }

  ngOnDestroy() {
    this.dataTableQuerySubscription.unsubscribe();
    this.detailModalQuerySubscription.unsubscribe();
    this.serviceInstanceModalQuerySubscription.unsubscribe();
    this.configfileXmlModalQuerySubscription.unsubscribe();
    this.logfileXmlModalQuerySubscription.unsubscribe();
  }
  onExportClick(datatable: any) {
    let options: any = {
      fileName: 'ServiceInstance',
      sheetName: 'ServiceInstance',
      exportData : this.EXPORTED_COLUMNS
    };

    if (datatable)
      this.export(datatable,options);
    // datatable.exportCSV(options);
      //this.grid.exportData(options);
  }

  public export(e: any, options: any) {
    const hiddenColumns: any[] = [];

    e.columns.forEach((c) => {
        if(c.field==='Action') {
        hiddenColumns.push({field: c.field, col:c});
        c.field='';
      }      
    });

    e.exportCSV(options);
    hiddenColumns.forEach((hc) => {
      hc.col.field = hc.field;
    });
  }

 
  public isCardMaintainanceProduct() {
    if (this.productCode === CONSTANTS.productCodes.RDMNT) {
      return true;
    }
    return false;
  }

  setProductInfo() {
    let productList = this._valutService.get(APP_KEYS.userContext);
    if (productList != null) {
      productList.assginedProducts.forEach(prod => {
        if (prod.productId == this.productId) {
          this.Heading = prod.productName;
        }
      });
    }
  }

  public onSearch(searchText: string, datatable: any): void {
   
      if (datatable) {
        datatable.filter(searchText, 'ServiceInstanceID', 'contains');
        if (datatable.columns.length == 0) {
          datatable.filter(searchText, 'ServiceInstanceID', 'contains');
        }
      }
    if (datatable) {
      datatable.filter(searchText, 'ServiceInstanceID', 'contains');
    }
    searchText = searchText.toUpperCase();
   
  }
  public RefreshFilterboxGrid(dataTable: any) {
    this.onSearch('', dataTable);
  }
  private _setGridData(instances?: ServiceInstanceContext[]) {
    this.instances = instances || this.instances || [];
  }

  private _getGridData() {
    this.loading = true;
    this.instances = [];
    this._prodSvc.RetrieveServiceInstances(this.productId).subscribe(
      response => {
        if (response && response.length > 0) {
          response.forEach((si: ServiceInstanceContext) => {
            this.instances.push(si);
          });
        }
        console.log(this.instances);
        this.loading = false;
        this.ngAfterViewInit();
      },
      (err: any) => {}
    );
  }

  private _getProdFIIDs(assignedFIID = null) {
    this.fiList = [];
    this.dropdownList = [];

    this.loadingFIDs = true;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (this._userDetails != null) {
      this._accountSvc
        .RetrieveFIInformationByProductId(
          this.productId,
          this._userDetails.userId
        )
        .subscribe(
          response => {
            if (response && response.length > 0) {
              response.forEach((f: FiContext) => {
                this.fiList.push(f);
              });
              this.dropdownList = this.fiList;
              this.FiSelect = this.fiList; // this.faSelected;
              this.FISelectedAll(this.fiList);
            }
          },
          (err: any) => {
            this._toastr.error(
              CONSTANTS.sharedComponentMsgs.serviceInstance.FailedLoadFIS
            );
            this.loadingFIDs = false;
          }
        );
    }
    //this._filterFiLists();
    this.loadingFIDs = false;
  }

  public retrieveServiceHosts() {
    this.loadingServicehostID = true;
    //this._fiSvc.getFIs().subscribe(

    this._prodSvc.RetrieveServiceHosts().subscribe(
      response => {
        if (response && response.length > 0) {
          response.forEach((hostlist: ServiceHostContext) => {
            this.ServiceHostList.push(hostlist);
          });
        }
      },
      (err: any) => {
        this.loadingServicehostID = false;
      }
    );
    this.loadingServicehostID = false;
  }
  public retrieveConfigTemplateData() {
    this.loadingContainerConfigID = true;

    this._prodSvc.retrieveConfigTemplateData().subscribe(
      response => {
        if (response && response.length > 0) {
          response.forEach((configTemplate: ServiceHostContext) => {
            this.ConfigTemplateList.push(configTemplate);
            this.ConfigLogTemplateList.push(configTemplate);
          });
        }
      },
      (err: any) => {
        this.loadingContainerConfigID = false;
      }
    );

    //this._filterFiLists();
    this.loadingContainerConfigID = false;
  }
  public retrieveDictionaryData(KeyValue: any) {
    this.loadingStatusID = true;
    //this._fiSvc.getFIs().subscribe(

    this._prodSvc.retrieveDictionaryData(KeyValue).subscribe(
      response => {
        if (response && response.length > 0) {
          // this.fiList = response ;
          response.forEach((Dicstatus: ServiceHostContext) => {
            if (KeyValue == "Status") {
              this.StatusList.push(Dicstatus);
            }

            if (KeyValue == "MessagingTransformType") {
              this.MessageTransformList.push(Dicstatus);
            }

            if (KeyValue == "MessagingSettingFile") {
              this.MessageSettingList.push(Dicstatus);
            }

            if (KeyValue == "IsoSpecification") {
              this.IsoSpecificationList.push(Dicstatus);
            }

            if (KeyValue == "ApplicationModule") {
              this.AppModuleList.push(Dicstatus);
            }
            if (KeyValue == "ServiceChannelType") {
              this.ServiceChannelTypeList.push(Dicstatus);
            }

            // console.debug(this.StatusList);
            // console.debug(this.MessageTransformList);
          });
        }
      },
      (err: any) => {
        this.loadingStatusID = false;
      }
    );

    //this._filterFiLists();
    this.loadingStatusID = false;
  }

  public onconfigfileXmlSaveClick() {
    (Swal as any)
      .fire({
        title: CONSTANTS.genericCRUDMsgs.xmlsaveConfirm,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this.configfilexmlsaving = true;
          // let file = 'C:\\File/ISeriesPscuMessaging.xml';
          let file = this.serviceInstanceForm.controls["MessagingSettingFile"]
            .value;
          this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
          let filePath = String.raw`${file}`.split("\\").join("/");

          let data = this.configfileXmlForm.getRawValue();
          data.FilePath = filePath;
          data.User = this._userDetails.username;

          this._prodSvc.saveFileContent(data).subscribe(
            response => {
              this.configfilexmlsaving = false;
              this._toastr.success(
                CONSTANTS.sharedComponentMsgs.serviceInstance.saveSettingFile
              );
              this.configfileXmlModal.close();
            },
            err => {
              this.configfilexmlsaving = false;
              this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
              this.configfileXmlModal.close();
            }
          );
        } else {
          this.configfileXmlModal.close();
        }
      });
  }

  public retrieveFileContent() {
    //let file = 'C:\\File/ISeriesPscuMessaging.xml';
    let file = this.serviceInstanceForm.controls["MessagingSettingFile"].value;
    let serverName = this.serviceInstanceForm.controls["TcpChannelName"].value;
    let serverIP = this.serviceInstanceForm.controls["TcpServerIP"].value;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    let filePath = String.raw`${file}`.split("\\").join("/");
    this._prodSvc
      .retrieveFileContent(
        filePath,
        this._userDetails.username,
        serverName,
        serverIP
      )
      .subscribe(
        response => {
          if (response.FileContent != null) {
            this.configfileXml = response.FileContent;
            this.configfileXmlForm.setValue({
              FileContent: response.FileContent
            });
            this.configfileXmlModal.open();
          } else {
            this._toastr.error("Invalid data. " + response.Message);
          }
        },
        (err: any) => {}
      );
  }

  ReloadappChangeEvent(event) {
    // if ( event.target.checked ) {
    this.Reloadapptouched = true;
    // console.debug( this.Reloadapptouched );
    // }
  }

  public onServiceInstanceSaveClick = () => {
    this.newfiselect = [];
    // this.InvalidExistingInstanceName == false
    if (
      this.serviceInstanceForm.invalid ||
      this.invalidIPAddress == true ||
      this.invalidURL == true ||
      this.invalidURL2 == true ||
      this.invalidURL3 == true ||
      this.invalidLogFilePath == true ||
      this.Reloadapptouched == false
    ) {
      this._toastr.error("Invalid data, Please enter data in required fields");
    } else {
      let data = this.serviceInstanceForm.getRawValue();
      this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
      if (this.ServiceInstanceEditing.ServiceInstanceID)
        data = _.merge(this.ServiceInstanceEditing, data);

      data.SviID = data.SviID || 0;
      data.PrdID = this.productId;
      data.HscID = this.selectedServiceHostID;
      data.ServiceHost = this.selectedHostType;
      data.CreateBy = this._userDetails.username;
      data.UpdateBy = this._userDetails.username;
      data.isRestartProcess = false;
      data.Status = this.selectedStatusType;
      let i;
      for (i = 0; i <= this.FiSelect.length - 1; i++) {
        this.newfiselect.push(this.FiSelect[i].FIID);
      }
      data.AssignedFIList = this.PreviousFISelect;
      data.UpdatedFIList = this.newfiselect;
      //data.FIMapList = this.FiSelect;
      data.ApplicationModule = this.selectedApplicationModuleType;
      data.MessagingTransformType = this.selectedMsgTransType;
      data.ServiceChannelType = this.selectedSvcChannelType;
      data.LogFilePath = this.serviceInstanceForm.controls["LogFilePath"].value;
      data.MessagingSettingFile = this.selectedMsgSettingType;
      data.ReloadAppFile = this.serviceInstanceForm.controls[
        "ReloadAppFile"
      ].value;
      if (data.Status == "PLANNED" || data.Status == "DRBACKUP") {
        data.Command = "STOP";
      }
      if (
        data.ServiceConfigTemplateId == "" ||
        data.ServiceConfigTemplateId == 0
      ) {
        data.ServiceConfigTemplateId = null;
      }
      if (data.LogConfigTemplateId == "" || data.LogConfigTemplateId == 0) {
        data.LogConfigTemplateId = null;
      }
      if (data.TcpPort == "" || data.TcpPort == 0) {
        data.TcpPort = null;
      }

      this.saving = true;
      this._prodSvc.saveServiceInstance(data).subscribe(
        response => {
          if (response){
          this._getGridData();
          this.serviceInstanceModal.close();
          this.ServiceInstanceEditing = null;
          this.serviceInstanceForm = null;
          this.invalidIPAddress = false;
          this.invalidURL = false;
          this.invalidURL2 = false;
          this.invalidURL3 = false;
          this.invalidLogFilePath = false;
          this.selectedStatusType = "";
          this.selectedStatus = 0;
          this.selectedApplicationModuleType = "";
          this.selectedApplicationModule = 0;
          this.selectedMessagingTransformType = 0;
          this.selectedMsgTransType = "";
          this.selectedMsgSettingFile = 0;
          this.selectedMsgSettingType = "";
          this.selectedIsoID = 0;
          this.selectIsoSpecification = "";
          this.selectedServiceChannelType = 0;
          this.selectedSvcChannelType = "";
          this.selectedServiceChannelType = 0;
          this.selectedServiceConfigTemplateID = 0;
          this.selectedLogConfigTemplateID = 0;
          this.newfiselect = [];
          this.InvalidExistingInstanceName = false;
          //this.FiSelect;

          this.saving = false;
          this._toastr.success(
            CONSTANTS.sharedComponentMsgs.serviceInstance.saveSVCInstance
          );
        }
        },
        err => {
          this.saving = false;
          this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
        }
      );
    }
  };

  public onServiceInstancecreateClick = ($event: any) => {
    this.dropdownList = this.fiList;
    this.FiSelect = [];
    if (this.serviceInstanceModal.isOpen) return;

    this.selectedFIID = 0;
    this.saving = false;
    this.invalidURL = false;
    this.invalidURL2 = false;
    this.invalidURL3 = false;
    this.invalidLogFilePath = false;
    this.selectedServiceHostID = 0;
    this.selectedStatus = 0;
    this.selectedApplicationModule = 0;
    this.selectedMessagingTransformType = 0;
    this.selectedServiceChannelType = 0;
    this.selectedMsgSettingFile = 0;
    this.selectedIsoID = 0;
    this.selectedServiceConfigTemplateID = 0;
    this.selectedLogConfigTemplateID = 0;
    this.invalidIPAddress = false;

    this.InvalidExistingInstanceName = false;
    this._buildServiceInstanceForm();
    this.serviceInstanceModal.open();
  };
  public onServiceInstanceCancelClick = (data: any, node: any) => {
    this.serviceInstanceModal.close();
    this.serviceInstanceForm = null;
    this.invalidIPAddress = false;
    this.selectedStatusType = "";
    this.selectedApplicationModuleType = "";
    this.selectedMsgTransType = "";
    this.selectedSvcChannelType = "";
    this.selectedMsgSettingType = "";
    this.selectIsoSpecification = "";
    this.selectedServiceChannelType = 0;
    this.selectedApplicationModule = 0;
    this.selectedStatus = 0;
    this.selectedMessagingTransformType = 0;
    this.selectedMsgSettingFile = 0;
    this.selectedIsoID = 0;
    this.selectedServiceConfigTemplateID = 0;
    this.selectedLogConfigTemplateID = 0;
    this.selectedServiceHostID = 0;
    this.InvalidExistingInstanceName = false;
    this.invalidLogFilePath = false;
    this.invalidURL = false;
    this.invalidURL2 = false;
    this.invalidURL3 = false;
  };

  onExpandView(data: any) {
    let index = this.instances.findIndex((si: ServiceInstanceContext) => {
      return data.data.SviID === si.SviID;
    });
    this.childindex = index;
    if (data.data.FINames == "" || data.data.FINames == null) {
      this.FINamesCount = 0;
    } else {
      this.FINamesCount = 1;
    }
    this._buildServiceInstanceForm(data.data);
    this.detailModal.open();
  }

  onRestartClick(restartdata: any) {
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);

    let NewCommandvalue: string = "";
    let NewCommandDisplayvalue: string = "";
    let msg = "";
    if (
      restartdata.data.Status == "PLANNED" ||
      restartdata.data.Status == "DRBACKUP"
    ) {
      (Swal as any)
        .fire({
          title:
            CONSTANTS.sharedComponentMsgs.serviceInstance
              .startServiceStatusRestriction,
          type: "warning",
          allowOutsideClick: false
          // showCancelButton: true,
          // cancelButtonColor: '#d33',
          // cancelButtonText: 'Ok'
        })
        .then(result => {
          if (result.value) {
          }
        });
    } else {
      this.saving = true;
      if (restartdata.data.Command == "STOP") {
        NewCommandvalue = "START";
        NewCommandDisplayvalue = "Started";
        msg =
          CONSTANTS.sharedComponentMsgs.serviceInstance.startServiceInstance;
      } else {
        NewCommandvalue = "STOP";
        NewCommandDisplayvalue = "Stopped";
        msg = CONSTANTS.sharedComponentMsgs.serviceInstance.stopServiceInstance;
      }

      (Swal as any)
        .fire({
          title: msg,
          type: "warning",
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        })
        .then(result => {
          if (result.value) {
            this._prodSvc
              .RestartServiceInstance(
                restartdata.data.SviID,
                NewCommandvalue,
                this._userDetails.username
              )
              .subscribe(
                response => {
                  if (response) {
                    this._setGridData();
                  }
                  this._getGridData();
                  this.saving = false;
                  this._toastr.success(
                    "Service Instance " +
                      NewCommandDisplayvalue +
                      " successfully!"
                  );
                },
                err => {
                  this._toastr.error(
                    CONSTANTS.sharedComponentMsgs.serviceInstance
                      .failedStartService
                  );
                }
              );
          }
        });
    }
  }

  public onServiceInstanceDetailCloseClick() {
    this.detailModal.close();
  }
  public onServiceInstanceEditClick = (data: any) => {
    this.dropdownList = this.fiList;
    this.FiSelect = [];
    this.PreviousFISelect = [];
    if (data.data.FIAssignedList) {
      let i;
      for (i = 0; i <= data.data.FIAssignedList.length - 1; i++) {
        this.dropdownList.forEach(element => {
          if (element.FIID == data.data.FIAssignedList[i].FIID) {
            this.FiSelect.push(element);
            this.PreviousFISelect.push(element.FIID);
          }
        });
      }
    }

    this.Reloadapptouched = true;
    this.selectedFIID =
      data.data.FIID && data.data.FIID != null ? data.data.FIID : 0;
    this.selectedHostType = data.data.ServiceHost;
    this.selectedStatusType = data.data.Status;
    this.selectedApplicationModuleType = data.data.ApplicationModule;
    this.selectedMsgTransType = data.data.MessagingTransformType;
    this.selectedMsgSettingType = data.data.MessagingSettingFile;
    this.selectIsoSpecification = data.data.IsoSpecfication;
    this.selectedSvcChannelType = data.data.ServiceChannelType;
    this.selectedServiceConfigTemplateID = data.data.ServiceConfigTemplateId;
    this.selectedLogConfigTemplateID = data.data.LogConfigTemplateId;
    this.selectedSvcChannelType = data.data.ServiceChannelType;
    this.getStatusTypeId(data.data.Status);
    this.getAppModuleId(data.data.ApplicationModule);
    this.getMsgTransTypeId(data.data.MessagingTransformType);
    this.getMsgSettingFileTypeId(data.data.MessagingSettingFile);
    this.getIsoSpecificationTypeId(data.data.IsoSpecfication);
    this.getServiceChannelTypeId(data.data.ServiceChannelType);
    this.getHostId(data.data.ServiceHost);
    this.invalidIPAddress = false;
    this.selectedIsoID = data.data.IsoSpecfication;
    this._buildServiceInstanceForm(data.data);
    this.serviceInstanceModal.open();
  };
  public getStatusTypeId(StatusType: string) {
    let i = 0;
    let StatusID = 0;
    for (i = 0; i <= this.StatusList.length - 1; i++) {
      if (this.StatusList[i].DictValue == StatusType) {
        StatusID = this.StatusList[i].DictID;
      }
    }

    this.selectedStatus = StatusID;
  }
  public getAppModuleId(AppModuleType: string) {
    let i = 0;
    let AppModuleID = 0;
    for (i = 0; i <= this.AppModuleList.length - 1; i++) {
      if (this.AppModuleList[i].DictValue == AppModuleType) {
        AppModuleID = this.AppModuleList[i].DictID;
      }
    }

    this.selectedApplicationModule = AppModuleID;
  }
  public getMsgTransTypeId(MsgTransType: string) {
    let i = 0;
    let MsgTransTypeID = 0;
    for (i = 0; i <= this.MessageTransformList.length - 1; i++) {
      if (this.MessageTransformList[i].DictValue == MsgTransType) {
        MsgTransTypeID = this.MessageTransformList[i].DictID;
      }
    }

    this.selectedMessagingTransformType = MsgTransTypeID;
  }
  public getServiceChannelTypeId(ServiceChannelType: string) {
    let i = 0;
    let ServiceChannelTypeID = 0;
    for (i = 0; i <= this.ServiceChannelTypeList.length - 1; i++) {
      if (this.ServiceChannelTypeList[i].DictValue == ServiceChannelType) {
        ServiceChannelTypeID = this.ServiceChannelTypeList[i].DictID;
      }
    }

    this.selectedServiceChannelType = ServiceChannelTypeID;
  }
  public getMsgSettingFileTypeId(MsgSettingFileType: string) {
    let i = 0;
    let MsgSettingFileID = 0;
    for (i = 0; i <= this.MessageSettingList.length - 1; i++) {
      if (this.MessageSettingList[i].DictValue == MsgSettingFileType) {
        MsgSettingFileID = this.MessageSettingList[i].DictID;
      }
    }

    this.selectedMsgSettingFile = MsgSettingFileID;
  }

  public getIsoSpecificationTypeId(IsoSpecificationType: string) {
    let i = 0;
    let IsoSpecificationID = 0;
    for (i = 0; i <= this.IsoSpecificationList.length - 1; i++) {
      if (this.IsoSpecificationList[i].DictValue == IsoSpecificationType) {
        IsoSpecificationID = this.IsoSpecificationList[i].DictID;
      }
    }

    this.selectedIsoID = IsoSpecificationID;
  }

  public getHostId(ServiceHost: string) {
    let i = 0;
    let hostTypeId = 0;
    for (i = 0; i <= this.ServiceHostList.length - 1; i++) {
      if (this.ServiceHostList[i].Name == ServiceHost) {
        hostTypeId = this.ServiceHostList[i].HscID;
      }
    }
    //loop through this list where then Name matches with containerType this.ServiceHostList

    this.selectedServiceHostID = hostTypeId;
  }

  public onServiceInstanceDeleteClick = (data: any, node: any) => {
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
          this._prodSvc
            .removeServiceInstance(data.data.SviID)
            .subscribe(response => {
              let index = this.instances.findIndex(
                (si: ServiceInstanceContext) => {
                  return data.data.SviID === si.SviID;
                }
              );

              if (index >= 0) this.instances.splice(index, 1);

              this._toastr.success(
                CONSTANTS.sharedComponentMsgs.serviceInstance.deleteSVCInstance
              );
              this._getGridData();
            });
        }
      });
  };

  SHChange(SHlist) {
    this.selectedServiceHostID = SHlist.target.value;
    let selectedOptions = event.target["options"];
    let selectedIndex = selectedOptions.selectedIndex;
    let selectElementText = selectedOptions[selectedIndex].text;
    this.selectedHostType = selectElementText;
  }

  CTChange(CTList) {
    this.selectedServiceConfigTemplateID = CTList.target.value;
    let selectedServiceConfigTemplateOptions = event.target["options"];
    let selectedServiceCTIndex =
      selectedServiceConfigTemplateOptions.selectedIndex;
    let selectServiceCTElementText =
      selectedServiceConfigTemplateOptions[selectedServiceCTIndex].text;
    this.selectedServiceConfigTempType = selectServiceCTElementText;
  }

  CTLogChange(CTLogList) {
    this.selectedLogConfigTemplateID = CTLogList.target.value;
    let selectedLogConfigTemplateOptions = event.target["options"];
    let selectedLogCTIndex = selectedLogConfigTemplateOptions.selectedIndex;
    let selectLogCTElementText =
      selectedLogConfigTemplateOptions[selectedLogCTIndex].text;
    this.selectedLogConfigTempType = selectLogCTElementText;
  }

  StatusChange(Statuslist) {
    this.selectedStatus = Statuslist.target.value;
    let selectedStatusOptions = event.target["options"];
    let selectedStatusIndex = selectedStatusOptions.selectedIndex;
    let selectStatusElementText =
      selectedStatusOptions[selectedStatusIndex].text;
    this.selectedStatusType = selectStatusElementText;
  }
  ApplicationModuleChange(AppModuleList) {
    this.selectedApplicationModule = AppModuleList.target.value;
    let selectedApplicationModuleOptions = event.target["options"];
    let selectedApplicationModuleIndex =
      selectedApplicationModuleOptions.selectedIndex;
    let selectApplicationModuleElementText =
      selectedApplicationModuleOptions[selectedApplicationModuleIndex].text;
    this.selectedApplicationModuleType = selectApplicationModuleElementText;
  }
  MessagingTransformTypeChange(MessageTransformList) {
    this.selectedMessagingTransformType = MessageTransformList.target.value;
    let selectedMsgTransTypeOptions = event.target["options"];
    let selectedMsgTransTypeIndex = selectedMsgTransTypeOptions.selectedIndex;
    let selectMsgTransTypeElementText =
      selectedMsgTransTypeOptions[selectedMsgTransTypeIndex].text;
    this.selectedMsgTransType = selectMsgTransTypeElementText;
  }
  ServiceChannelTypeChange(ServiceChannelTypeList) {
    this.selectedServiceChannelType = ServiceChannelTypeList.target.value;
    let selectedServiceChannelTypeOptions = event.target["options"];
    let selectedServiceChannelTypeIndex =
      selectedServiceChannelTypeOptions.selectedIndex;
    let ServiceChannelTypeElementText =
      selectedServiceChannelTypeOptions[selectedServiceChannelTypeIndex].text;
    this.selectedSvcChannelType = ServiceChannelTypeElementText;
  }
  MsgSettingFileChange(MessageSettingList) {
    this.selectedMsgSettingFile = MessageSettingList.target.value;
    let selectedMsgSettingOptions = event.target["options"];
    let selectedMsgSettingIndex = selectedMsgSettingOptions.selectedIndex;
    let selectMsgSettingElementText =
      selectedMsgSettingOptions[selectedMsgSettingIndex].text;
    this.selectedMsgSettingType = selectMsgSettingElementText;
  }
  IsoChange(IsoSpecificationList) {
    this.selectedIsoID = IsoSpecificationList.target.value;
    let selectedIsoOptions = event.target["options"];
    let selectedIsoIndex = selectedIsoOptions.selectedIndex;
    let selectIsoElementText = selectedIsoOptions[selectedIsoIndex].text;
    this.selectIsoSpecification = selectIsoElementText;
  }

  // FIChange(FIlist) {
  //   this.selectedFIID = FIlist.FIID;
  //   this.serviceInstanceForm.controls['FIName'].setValue(FIlist.Name);

  // }

  FISelectedOne(SelectedFI) {
    let pdata = [];
    pdata = this.fiList;
    let i;
    pdata.forEach(element => {
      if (element.FIID == SelectedFI.FIID) {
        this.FISSelected.push(SelectedFI.FIID);
      }
    });
  }
  FISelectedDeOne(SelectedFI) {
    let pdata = [];
    pdata = this.FISSelected;
    let i;
    for (i = 0; i < pdata.length; i += 1) {
      if (pdata[i] == SelectedFI.FIID) {
        pdata.splice(i, 1);
      }
    }
    this.FISSelected = pdata;
  }
  FISelectedDeAll(SelectedFI) {
    this.FISSelected = [];
  }

  FISelectedAll(SelectedFI) {
    let pdata = [];
    pdata = this.fiList;
    let i;
    this.FISSelected = [];

    for (i = 0; i < SelectedFI.length; i += 1) {
      pdata.forEach(element => {
        if (element.FIID == SelectedFI[i].FIID) {
          this.FISSelected.push(SelectedFI[i].FIID);
        }
      });
    }
  }

  public populateContainerName(env: any) {
    this.serviceInstanceForm.controls["ServiceInstanceID"].setValue(
      "PSCUDXSVC_" + env.target.value + "A"
    );
    this.UniqueServiceInstanceName(env);
  }
  isvalueExists(env: any) {
    this.serviceInstanceForm.controls["TcpServerIP"].value == "";
    {
      this.invalidIPAddress = false;
    }
  }
  public restrictToDirectoryPath(env: any) {
    var regex = new RegExp(
      '^[A-Za-z]:(?:\\\\(?!["*/:?|<>\\\\,;[\\]+=.\\x00-\\x20])[^"*/:?|<>\\\\[\\]]+){0,}(?:\\\\)?$'
    );

    const LogFilePath = this.serviceInstanceForm.get("LogFilePath").value;

    if (LogFilePath == env.target.value) {
      if (regex.test(env.target.value)) {
        this.invalidLogFilePath = false;
      } else {
        this.invalidLogFilePath = true;
      }
    } else if (LogFilePath == "") {
      this.invalidLogFilePath = false;
    }
  }
  restricttoURL(env: any) {
    var regex = new RegExp(
      "^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[0-9a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?"
    );

    const ServiceURI = this.serviceInstanceForm.get("ServiceURI").value;
    const ServiceURI2 = this.serviceInstanceForm.get("ServiceURI2").value;
    const ServiceURI3 = this.serviceInstanceForm.get("ServiceURI3").value;

    if (ServiceURI == env.target.value) {
      if (regex.test(env.target.value)) {
        this.invalidURL = false;
      } else {
        this.invalidURL = true;
      }
    } else if (ServiceURI == "") {
      this.invalidURL = false;
    }

    if (ServiceURI2 == env.target.value) {
      if (regex.test(env.target.value)) {
        this.invalidURL2 = false;
      } else {
        this.invalidURL2 = true;
      }
    } else if (ServiceURI2 == "") {
      this.invalidURL2 = false;
    }

    if (ServiceURI3 == env.target.value) {
      if (regex.test(env.target.value)) {
        this.invalidURL3 = false;
      } else {
        this.invalidURL3 = true;
      }
    } else if (ServiceURI3 == "") {
      this.invalidURL3 = false;
    }
  }
  public UniqueServiceInstanceName(env: any) {
    if ((this.InvalidExistingInstanceName = true)) {
      this.InvalidExistingInstanceName = false;
    }
    let i = 0;
    let j = 0;
    for (i = 0; i <= this.instances.length - 1; i++) {
      if (
        this.productId &&
        this.instances[i].ServiceInstanceID.toUpperCase() ==
          env.target.value.toString().toUpperCase()
      ) {
        //hostingname is name as per DB
        this.InvalidExistingInstanceName = true;
      }
    }
  }
  public restricttoUpperCase(env: any) {
    // env.target.value = env.target.value.toUpperCase();
    if (
      this.serviceInstanceForm.controls["TcpChannelName"].value ==
      env.target.value
    ) {
      this.serviceInstanceForm.controls["TcpChannelName"].setValue(
        env.target.value.toUpperCase()
      );
    }

    if (
      this.serviceInstanceForm.controls["ServiceInstanceID"].value ==
      env.target.value
    ) {
      this.serviceInstanceForm.controls["ServiceInstanceID"].setValue(
        env.target.value.toUpperCase()
      );
    }

    if (
      this.serviceInstanceForm.controls["ServiceChannelName"].value ==
      env.target.value
    ) {
      this.serviceInstanceForm.controls["ServiceChannelName"].setValue(
        env.target.value.toUpperCase()
      );
    }

    if (
      this.serviceInstanceForm.controls["ServiceChannelName2"].value ==
      env.target.value
    ) {
      this.serviceInstanceForm.controls["ServiceChannelName2"].setValue(
        env.target.value.toUpperCase()
      );
    }

    if (
      this.serviceInstanceForm.controls["ServiceChannelName3"].value ==
      env.target.value
    ) {
      this.serviceInstanceForm.controls["ServiceChannelName3"].setValue(
        env.target.value.toUpperCase()
      );
    }
  }

  public validateIPAddress(elementValue) {
    var IPAddressPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    return IPAddressPattern.test(elementValue);
  }
  public restrictToIPAddress(env: any) {
    env.target.value = env.target.value.replace(/[^0-9.]+$/g, "");
    var validIP = this.validateIPAddress(env.target.value);
    if (!validIP) {
      this.invalidIPAddress = true;
    } else {
      this.invalidIPAddress = false;
    }
  }

  public restrictToAplhaNumericSpace(env: any) {
    env.target.value = env.target.value.replace(/[^ A-Za-z0-9]+$/g, "");
  }

  public restrictToAplhaNumericSpacefwdslash(env: any) {
    env.target.value = env.target.value.replace(/[^/ A-Za-z0-9]+$/g, "");
  }
  private _buildServiceInstanceForm(
    serviceInstanceList: ServiceInstanceContext = new ServiceInstanceContext()
  ) {
    this.ServiceInstanceEditing = serviceInstanceList;
    if (this.ServiceInstanceEditing.SviID) {
      this.serviceInstanceForm = this._fb.group({
        ServiceHost: new FormControl(
          this.ServiceInstanceEditing.ServiceHost,
          Validators.required
        ),
        ServiceInstanceID: new FormControl(
          this.ServiceInstanceEditing.ServiceInstanceID,
          Validators.required
        ),
        ServiceDescription: new FormControl(
          this.ServiceInstanceEditing.ServiceDescription
        ),
        Product: new FormControl(this.ServiceInstanceEditing.ProductName),
        TcpChannelName: new FormControl(
          this.ServiceInstanceEditing.TcpChannelName
        ),
        TcpServerIP: new FormControl(this.ServiceInstanceEditing.TcpServerIP),
        TcpPort: new FormControl(this.ServiceInstanceEditing.TcpPort),
        Status: new FormControl(
          this.ServiceInstanceEditing.Status,
          Validators.required
        ),
        Command: new FormControl(this.ServiceInstanceEditing.Command),
        ReloadAppFile: new FormControl(
          this.ServiceInstanceEditing.ReloadAppFile,
          Validators.required
        ),
        ApplicationModule: new FormControl(
          this.ServiceInstanceEditing.ApplicationModule
        ),
        MessagingTransformType: new FormControl(
          this.ServiceInstanceEditing.MessagingTransformType
        ),
        MessagingSettingFile: new FormControl(
          this.ServiceInstanceEditing.MessagingSettingFile
        ),
        IsoSpecfication: new FormControl(
          this.ServiceInstanceEditing.IsoSpecfication
        ),
        ServiceChannelName: new FormControl(
          this.ServiceInstanceEditing.ServiceChannelName
        ),
        ServiceURI: new FormControl(this.ServiceInstanceEditing.ServiceURI),
        ServiceContractType: new FormControl(
          this.ServiceInstanceEditing.ServiceContractType
        ),
        ServiceChannelType: new FormControl(
          this.ServiceInstanceEditing.ServiceChannelType
        ),
        ServiceChannelName2: new FormControl(
          this.ServiceInstanceEditing.ServiceChannelName2
        ),
        ServiceURI2: new FormControl(this.ServiceInstanceEditing.ServiceURI2),
        ServiceChannelName3: new FormControl(
          this.ServiceInstanceEditing.ServiceChannelName3
        ),
        ServiceURI3: new FormControl(this.ServiceInstanceEditing.ServiceURI3),
        ServiceConfigTemplateId: new FormControl(
          this.ServiceInstanceEditing.ServiceConfigTemplateId
        ),
        LogConfigTemplateId: new FormControl(
          this.ServiceInstanceEditing.LogConfigTemplateId
        ),
        LogFilePath: new FormControl(this.ServiceInstanceEditing.LogFilePath),
        ServiceVersion: new FormControl(
          this.ServiceInstanceEditing.ServiceVersion
        ),
        FIName: new FormControl("")
      });
    } else {
      this.serviceInstanceForm = this._fb.group({
        ServiceHost: new FormControl("", Validators.required),
        ServiceInstanceID: new FormControl("", Validators.required),
        ServiceDescription: new FormControl(""),
        Product: new FormControl(this.Heading),
        TcpChannelName: new FormControl(""),
        TcpServerIP: new FormControl(""),
        TcpPort: new FormControl(""),
        Status: new FormControl("", Validators.required),
        Command: new FormControl("STOP"),
        ReloadAppFile: new FormControl("", Validators.required),
        ApplicationModule: new FormControl(""),
        MessagingTransformType: new FormControl(""),
        MessagingSettingFile: new FormControl(""),
        IsoSpecfication: new FormControl(""),
        ServiceChannelName: new FormControl(""),
        ServiceURI: new FormControl(""),
        ServiceContractType: new FormControl(""),
        ServiceChannelType: new FormControl(""),
        ServiceChannelName2: new FormControl(""),
        ServiceURI2: new FormControl(""),
        ServiceChannelName3: new FormControl(""),
        ServiceURI3: new FormControl(""),
        ServiceConfigTemplateId: new FormControl(""),
        LogConfigTemplateId: new FormControl(""),
        ServiceVersion: new FormControl(""),
        LogFilePath: new FormControl(""),
        FIName: new FormControl("")
      });
    }
  }
}
