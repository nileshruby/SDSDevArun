import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  OnChanges,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import { LocalModalComponent } from "@shared/components";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import {
  DialogService,
  ProductService,
  VaultService,
  LoggingService,
  SessionService,
  InputValidationService
} from "@app/services";
import { ToastrService } from "ngx-toastr";
import { CONSTANTS } from "@entities/constants";
import { AccountService } from "@services/account.svc";
import * as moment from "moment";
import * as _ from "lodash";
import { ServiceHostContext } from "@entities/models";
import { DialogConfig, DialogTypes } from "@entities/dialog";
import { UserContext } from "./../../../../entities/user-context";
import { APP_KEYS } from "@entities/app-keys";
import Swal from "sweetalert2";
import beautify from "xml-beautifier";
import { RepositionScrollStrategy } from "@angular/cdk/overlay";
import { Subscription } from "rxjs";
@Component({
  selector: "app-service-host",
  templateUrl: "./service-host.component.html",
  styleUrls: ["./service-host.component.scss"]
})
export class ServiceHostComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren("serviceHostModal") serviceHostModalQuery: QueryList<
    LocalModalComponent
  >;
  serviceHostModalQuerySubscription: Subscription;
  serviceHostModal: LocalModalComponent;

  @ViewChildren("configfileXmlModal") configfileXmlModalQuery: QueryList<
    LocalModalComponent
  >;
  configfileXmlModalQuerySubscription: Subscription;
  configfileXmlModal: LocalModalComponent;
  

  @ViewChildren("logfileXmlModal") logfileXmlModalQuery: QueryList<
    LocalModalComponent
  >;
  logfileXmlModalQuerySubscription: Subscription;
  logfileXmlModal: LocalModalComponent;

  public configfileXml = beautify(
    `<?xml version="1.0" encoding="UTF-8"?><breakfast_menu><food><name>Belgian Waffles</name><price>$5.95</price><description>Two of our famous Belgian Waffles with plenty of real maple syrup</description><calories>650</calories></food><food><name>Strawberry Belgian Waffles</name><price>$7.95</price><description>Light Belgian waffles covered with strawberries and whipped cream</description><calories>900</calories></food><food><name>Berry-Berry Belgian Waffles</name><price>$8.95</price><description>Light Belgian waffles covered with an assortment of fresh berries and whipped cream</description><calories>900</calories></food><food><name>French Toast</name><price>$4.50</price><description>Thick slices made from our homemade sourdough bread</description><calories>600</calories></food><food><name>Homestyle Breakfast</name><price>$6.95</price><description>Two eggs, bacon or sausage, toast, and our ever-popular hash browns</description><calories>950</calories></food></breakfast_menu>`
  );
  public logfileXml = beautify(
    `<?xml version="1.0" encoding="UTF-8"?><breakfast_menu><food><name>Belgian Waffles</name><price>$5.95</price><description>Two of our famous Belgian Waffles with plenty of real maple syrup</description><calories>650</calories></food><food><name>Strawberry Belgian Waffles</name><price>$7.95</price><description>Light Belgian waffles covered with strawberries and whipped cream</description><calories>900</calories></food><food><name>Berry-Berry Belgian Waffles</name><price>$8.95</price><description>Light Belgian waffles covered with an assortment of fresh berries and whipped cream</description><calories>900</calories></food><food><name>French Toast</name><price>$4.50</price><description>Thick slices made from our homemade sourdough bread</description><calories>600</calories></food><food><name>Homestyle Breakfast</name><price>$6.95</price><description>Two eggs, bacon or sausage, toast, and our ever-popular hash browns</description><calories>950</calories></food></breakfast_menu>`
  );
  public loading = false;
  public saving = false;
  public configfilexmlsaving = false;
  public serviceHostForm: FormGroup;
  public configfileXmlForm: FormGroup;
  public logfileXmlForm: FormGroup;
  public ResetFilterboxForm: FormGroup;
  public ServiceHostEditing: ServiceHostContext = null;
  public hosts: ServiceHostContext[] = [];
  ptablehostList: any = [];
  public FileContentList: any = [];
  public ContainerTypeList: ServiceHostContext[] = [];
  public DataCenterSiteList: ServiceHostContext[] = [];
  public ConfigTemplateList: ServiceHostContext[] = [];
  public StatusList: ServiceHostContext[] = [];
  public _userDetails: UserContext = null;
  public selectedID: any = "";
  public childindex = 0;
  public selectedDataCenterFlagID: any = "";
  public selectedContainerType = "";
  public selectedStatusType = "";
  public selectedDataCenterSiteType = "";
  public selectedConfigTempType = "";
  public selectedContainerConfigID = "";
  public selectedConfigTemplateID = 0;
  public selectedStatus: any = "";
  public loadingContainerID = false;
  public loadingDataCenterID = false;
  public loadingContainerConfigID = false;
  public loadingStatusID = false;

  cols: any[] = [];
  expandedRows: any[] = [];
  public actionperfomed = false;
  public invalidIPAddress = false;
  public invalidAssemblyFilePath = false;
  public invalidConfigFilePath = false;
  public invalidLogFilePath = false;
  public InvalidExistingContainerName = false;
  public InvalidExistingHostingName = false;
  public IV: InputValidationService = new InputValidationService();

  constructor(
    private _fb: FormBuilder,
    private _accountSvc: AccountService,
    private _prodSvc: ProductService,
    private _dialogSvc: DialogService,
    private _sessionSvc: SessionService,
    private _toastr: ToastrService
  ) {
    // this._initGridConfig();
  }

  ngOnInit() {
    this.cols = [
      { field: "Name", header: "Container Hosting Name" },
      { field: "Description", header: "Description" },
      { field: "ContainerName", header: "Container Name" },
      { field: "ContainerType", header: "Container Type" },
      { field: "ServerName", header: "Server Name" },
      { field: "ServerIP", header: "Server IP" },
      { field: "SiteName", header: "Data Center Site" },
      { field: "Status", header: "Status" },
      { field: "ContainerRootDirectory", header: "Container Root Directory" }
    ];
    this.retrieveContainerTypes();
    this.retrieveDatCenterSites();
    this.retrieveConfigTemplateData();
    this.retrieveDictionaryData("Status");
    this._getGridData();
    this.configfileXmlForm = this._fb.group({
      FileContent: new FormControl(this.configfileXml)
    });
    this.logfileXmlForm = this._fb.group({
      FileContent: new FormControl(this.logfileXml)
    });
  }

  ngAfterViewInit() {
    this.serviceHostModalQuerySubscription = this.serviceHostModalQuery.changes.subscribe(
      (serviceHostQuery: QueryList<LocalModalComponent>) => {
        this.serviceHostModal = serviceHostQuery.first;
        this.serviceHostModalQuerySubscription.unsubscribe();
      }
    );
    this.configfileXmlModalQuerySubscription = this.configfileXmlModalQuery.changes.subscribe(
      (configfileXmlQuery: QueryList<LocalModalComponent>) => {
        this.configfileXmlModal = configfileXmlQuery.first;
        this.configfileXmlModalQuerySubscription.unsubscribe();
      }
    );
    this.logfileXmlModalQuerySubscription = this.logfileXmlModalQuery.changes.subscribe(
      (logfileXmlQuery: QueryList<LocalModalComponent>) => {
        this.logfileXmlModal = logfileXmlQuery.first;
        this.logfileXmlModalQuerySubscription.unsubscribe();
      }
    );
  }

  ngOnDestroy() {
    this.serviceHostModalQuerySubscription.unsubscribe();
    this.configfileXmlModalQuerySubscription.unsubscribe();
    this.logfileXmlModalQuerySubscription.unsubscribe();
  }

  public onSearch(searchText: string, datatable: any): void {
    if (datatable) {
      datatable.filterGlobal(searchText, "contains");
    }
  }
  public RefreshFilterboxGrid(dataTable: any) {
    this.onSearch("", dataTable);
  }

  public collapseAll() {
    this.expandedRows = [];
  }
  public retrieveContainerTypes() {
    this.loadingContainerID = true;
    //this._fiSvc.getFIs().subscribe(

    this._prodSvc.retrieveDictionaryData("ContainerType").subscribe(
      response => {
        if (response && response.length > 0) {
          // this.fiList = response ;
          response.forEach((container: ServiceHostContext) => {
            this.ContainerTypeList.push(container);
            console.debug(this.ContainerTypeList);
          });
        }
      },
      (err: any) => {
        this.loadingContainerID = false;
      }
    );

    //this._filterFiLists();
    this.loadingContainerID = false;
  }
  public retrieveDatCenterSites() {
    this.loadingDataCenterID = true;
    //this._fiSvc.getFIs().subscribe(

    this._prodSvc.retrieveDictionaryData("DataCenter").subscribe(
      response => {
        if (response && response.length > 0) {
          // this.fiList = response ;
          response.forEach((datacentersite: ServiceHostContext) => {
            this.DataCenterSiteList.push(datacentersite);
            console.debug(this.DataCenterSiteList);
          });
        }
      },
      (err: any) => {
        this.loadingDataCenterID = false;
      }
    );

    //this._filterFiLists();
    this.loadingDataCenterID = false;
  }

  public retrieveDictionaryData(KeyValue: any) {
    this.loadingStatusID = true;
    //this._fiSvc.getFIs().subscribe(

    this._prodSvc.retrieveDictionaryData(KeyValue).subscribe(
      response => {
        if (response && response.length > 0) {
          // this.fiList = response ;
          response.forEach((Dicstatus: ServiceHostContext) => {
            this.StatusList.push(Dicstatus);
            console.debug(this.StatusList);
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
  public retrieveConfigTemplateData() {
    this.loadingContainerConfigID = true;
    //this._fiSvc.getFIs().subscribe(

    this._prodSvc.retrieveConfigTemplateData().subscribe(
      response => {
        if (response && response.length > 0) {
          // this.fiList = response ;
          response.forEach((configTemplate: ServiceHostContext) => {
            this.ConfigTemplateList.push(configTemplate);
            console.debug(this.ConfigTemplateList);
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
  private _getGridData() {
    this.loading = true;
    this.hosts = [];
    //mockup data flow
    this._prodSvc.RetrieveServiceHosts().subscribe(
      response => {
        if (response && response.length > 0) {
          // this.fiList = response ;
          response.forEach((sh: ServiceHostContext) => {
            // console.log(sh);
            if (this.DataCenterSiteList.length > 0) {
              let i = 0;
              for (i = 0; i <= this.DataCenterSiteList.length - 1; i++) {
                let sname: any = sh.SiteName;
                if (this.DataCenterSiteList[i].DictID == sname) {
                  sh.SiteName = this.DataCenterSiteList[i].DictValue;
                }
              }
            }
            this.hosts.push(sh);
            this.ptablehostList = this.hosts;
            //this.fiList.push(f);
          });
        }
        // this._setGridData();
        this.loading = false;
      },
      (err: any) => {
        // this.loadingFIDs = false;
      }
    );

    //  if(this.hosts.length > 0 )
    //  {
    //  this.loading = true;
    //  this._setGridData();
    //  }
    //mockup data flow
  }

  // public onExportClick() {
  //   if (this.grid && this.grid.exportData)
  //     this.grid.exportData();
  // }

  // private _initGridConfig() {
  //   this.gridOptions = _.merge(<IGridOptions>{}, this._agSvc.defaultOptions);

  //   this.gridOptions.idField = 'HscID';
  //   this.gridOptions.columns = <IGridColumn[]>[
  //     // {
  //     //   headerName: 'ID',
  //     //   field: 'HscID'
  //     // },
  //     {
  //       headerName: 'Container Hosting Name',
  //       field: 'Name'
  //     },
  //     {
  //       headerName: 'Description',
  //       field: 'Description'
  //     },
  //     {
  //       headerName: 'Container Name',
  //       field: 'ContainerName',
  //       width: 135,
  //       minWidth: 135
  //     },
  //     {
  //       headerName: 'Container Type',
  //       field: 'ContainerType',
  //       width: 120,
  //       minWidth: 120
  //     },
  //     {
  //       headerName: 'Server Name',
  //       field: 'ServerName'
  //     },
  //     {
  //       headerName: 'Server IP',
  //       field: 'ServerIP',
  //       width: 108,
  //       minWidth: 108
  //     },
  //     {
  //       headerName: 'Data Center Site',
  //       field: 'SiteName',
  //       width: 100,
  //       minWidth: 100
  //     },  {
  //       headerName: 'Status',
  //       field: 'Status',
  //       width: 100,
  //       minWidth: 100
  //     },
  //     {
  //       headerName: 'Container Root Directory',
  //       field: 'ContainerRootDirectory',
  //       width: 135,
  //       minWidth: 135
  //     } ,
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
  //             onClick: this.onServiceHostEditClick.bind(this)
  //           },
  //           <IGridActionItem>{
  //             type: 'anchor',
  //             classes: 'button-image btn-delete',
  //             onClick: this.onServiceHostDeleteClick.bind(this)
  //           }
  //         ]
  //       },
  //       width: 75,
  //       minWidth: 75,
  //       maxWidth: 75
  //     }
  //   ];
  // }

  public onServiceHostEditClick = (data: any) => {
    this.selectedID = "";
    this.selectedContainerType = data.data.ContainerType;
    this.selectedDataCenterSiteType = data.data.SiteName;
    this.selectedContainerConfigID = data.data.ContainerConfigTemplateId;
    this.selectedConfigTemplateID = data.data.ContainerConfigTemplateId;
    this.selectedStatusType = data.data.Status;
    this.getContainerTypeId(data.data.ContainerType);
    this.getDataCenterTypeId(data.data.SiteName);
    this.getStatusTypeId(data.data.Status);
    this.invalidIPAddress = false;
    this._buildServiceHostForm(data.data);
    this.serviceHostModal.open();
  };

  public getContainerTypeId(containerType: string) {
    let i = 0;
    let containerTypeId: any = "";
    for (i = 0; i <= this.ContainerTypeList.length - 1; i++) {
      if (this.ContainerTypeList[i].DictValue == containerType) {
        containerTypeId = this.ContainerTypeList[i].DictID;
      }
    }
    this.selectedID = containerTypeId;
  }

  public getDataCenterTypeId(Datacenter) {
    let i = 0;
    let DSCTypeId: any = "";
    for (i = 0; i <= this.DataCenterSiteList.length - 1; i++) {
      if (this.DataCenterSiteList[i].DictValue == Datacenter) {
        DSCTypeId = this.DataCenterSiteList[i].DictID;
      }
    }
    this.selectedDataCenterFlagID = DSCTypeId;
  }

  public getStatusTypeId(StatusType: string) {
    let i = 0;
    let StatusID: any = "";
    for (i = 0; i <= this.StatusList.length - 1; i++) {
      if (this.StatusList[i].DictValue == StatusType) {
        StatusID = this.StatusList[i].DictID;
      }
    }

    this.selectedStatus = StatusID;
  }

  private _buildServiceHostForm(
    servicelist: ServiceHostContext = new ServiceHostContext()
  ) {
    this.ServiceHostEditing = servicelist;
    if (this.ServiceHostEditing.HscID) {
      this.serviceHostForm = this._fb.group({
        DCSiteFlag: new FormControl(
          this.ServiceHostEditing.SiteName,
          Validators.required
        ),
        ServerName: new FormControl(
          this.ServiceHostEditing.ServerName,
          Validators.required
        ),
        ServerIP: new FormControl(
          this.ServiceHostEditing.ServerIP,
          Validators.required
        ),
        ContainerName: new FormControl(
          this.ServiceHostEditing.ContainerName,
          Validators.required
        ),
        Description: new FormControl(this.ServiceHostEditing.Description),
        Status: new FormControl(
          this.ServiceHostEditing.Status,
          Validators.required
        ),
        ContainerType: new FormControl(
          this.ServiceHostEditing.ContainerType,
          Validators.required
        ),
        ContainerHostingName: new FormControl(
          this.ServiceHostEditing.Name,
          Validators.required
        ),
        ContainerRootDirectory: new FormControl(
          this.ServiceHostEditing.ContainerRootDirectory,
          Validators.required
        ),
        ContainerConfigFilePath: new FormControl(
          this.ServiceHostEditing.ContainerConfigFilePath,
          Validators.required
        ),
        ContainerConfigTemplate: new FormControl(
          this.ServiceHostEditing.ContainerConfigTemplateId
        ),
        LogLocation: new FormControl(this.ServiceHostEditing.LogFilePath),
        AssemblyLocation: new FormControl(
          this.ServiceHostEditing.AssemblyLocation
        )
      });
    } else {
      this.serviceHostForm = this._fb.group({
        DCSiteFlag: new FormControl("", Validators.required),
        ServerName: new FormControl("", Validators.required),
        ServerIP: new FormControl("", Validators.required),
        ContainerName: new FormControl("", Validators.required),
        Description: new FormControl(""),
        Status: new FormControl("", Validators.required),
        ContainerType: new FormControl("", Validators.required),
        ContainerHostingName: new FormControl("", Validators.required),
        ContainerRootDirectory: new FormControl("", Validators.required),
        ContainerConfigFilePath: new FormControl("", Validators.required),
        ContainerConfigTemplate: new FormControl(""),
        LogLocation: new FormControl(""),
        AssemblyLocation: new FormControl("")
      });
    }
  }

  public onServiceHostDeleteClick = (data: any, node: any) => {
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
            .removeServiceHost(data.data.HscID)
            .subscribe(response => {
              if (!response.isDeleted) {
                this._toastr.error(response.Message.toString());
              }
              if (response.isDeleted) {
                let index = this.hosts.findIndex((sh: ServiceHostContext) => {
                  return data.data.HscID === sh.HscID;
                });

                if (index >= 0) this.hosts.splice(index, 1);

                this._toastr.success(
                  "Host " + CONSTANTS.genericCRUDMsgs.deleteSuccess
                );
                // this._setGridData();
                this.ptablehostList = this.hosts;
              }
            });
        }
      });
  };

  public UniqueContainerName(env: any) {
    let serverName = "";
    if (this.serviceHostForm.controls["ServerName"].value) {
      serverName = this.serviceHostForm.controls["ServerName"].value.toString();
    } else {
      return;
    }
    if (this.InvalidExistingContainerName == true) {
      this.InvalidExistingContainerName = false;
    }
    let i = 0;
    let j = 0;
    for (i = 0; i <= this.hosts.length - 1; i++) {
      if (
        this.hosts[i].ServerName.toUpperCase() == serverName.toUpperCase() &&
        this.hosts[i].ContainerName.toUpperCase() ==
          env.target.value.toString().toUpperCase()
      ) {
        //hostingname is name as per DBif(
        if (!this.ServiceHostEditing.HscID) {
          this.InvalidExistingContainerName = true;
        }
      }
    }
  }
  public UniqueHostingName(env: any) {
    let serverName = "";
    if (this.serviceHostForm.controls["ServerName"].value) {
      serverName = this.serviceHostForm.controls["ServerName"].value.toString();
    } else {
      return;
    }

    if (this.InvalidExistingHostingName == true) {
      this.InvalidExistingHostingName = false;
    }

    let i = 0;
    for (i = 0; i <= this.hosts.length - 1; i++) {
      if (
        this.hosts[i].ServerName.toUpperCase() == serverName.toUpperCase() &&
        this.hosts[i].Name.toUpperCase() ==
          env.target.value.toString().toUpperCase()
      ) {
        //hostingname is name as per DB
        if (!this.ServiceHostEditing.HscID) {
          this.InvalidExistingHostingName = true;
        }
      }
    }
  }
  public onServiceHostcreateClick = () => {
    if (this.serviceHostModal.isOpen) {
      return;
    }
    this.invalidIPAddress = false;
    this.selectedID = "";
    this.selectedDataCenterFlagID = "";
    this.selectedStatus = "";
    this.selectedConfigTemplateID = 3;
    this.invalidAssemblyFilePath = false;
    this.invalidConfigFilePath = false;
    this.invalidIPAddress = false;
    this.InvalidExistingContainerName = false;
    this.InvalidExistingHostingName = false;
    this.invalidLogFilePath = false;
    this._buildServiceHostForm();
    this.serviceHostModal.open();
  };

  SHChange(SHlist) {
    this.selectedID = SHlist.target.value;
    let selectedOptions = event.target["options"];
    let selectedIndex = selectedOptions.selectedIndex;
    let selectElementText = selectedOptions[selectedIndex].text;
    this.selectedContainerType = selectElementText;
  }

  DCChange(DSCList) {
    this.selectedDataCenterFlagID = DSCList.target.value;
    let selectedDataCenterOptions = event.target["options"];
    let selectedDSCIndex = selectedDataCenterOptions.selectedIndex;
    let selectDSCElementText = selectedDataCenterOptions[selectedDSCIndex].text;
    this.selectedDataCenterSiteType = selectDSCElementText;
  }

  CTChange(CTList) {
    this.selectedConfigTemplateID = CTList.target.value;
    let selectedConfigTemplateOptions = event.target["options"];
    let selectedCTIndex = selectedConfigTemplateOptions.selectedIndex;
    let selectCTElementText =
      selectedConfigTemplateOptions[selectedCTIndex].text;
    this.selectedConfigTempType = selectCTElementText;
  }

  StatusChange(Statuslist) {
    this.selectedStatus = Statuslist.target.value;
    let selectedStatusOptions = event.target["options"];
    let selectedStatusIndex = selectedStatusOptions.selectedIndex;
    let selectStatusElementText =
      selectedStatusOptions[selectedStatusIndex].text;
    this.selectedStatusType = selectStatusElementText;
  }

  public onServiceHostCancelClick = (data: any, node: any) => {
    this.serviceHostModal.close();
    this.serviceHostForm = null;
    this.selectedID = "";
    this.selectedContainerType = "";
    this.selectedDataCenterSiteType = "";
    this.selectedStatusType = "";
    this.selectedConfigTemplateID = 0;
    this.selectedStatus = 0;
    this.invalidAssemblyFilePath = false;
    this.invalidConfigFilePath = false;
    this.invalidIPAddress = false;
    this.invalidLogFilePath = false;
    this.InvalidExistingContainerName = false;
    this.InvalidExistingHostingName = false;
  };

  public onServiceHostSaveClick = () => {
    if (
      this.serviceHostForm.invalid ||
      this.invalidIPAddress == true ||
      this.invalidAssemblyFilePath == true ||
      this.invalidConfigFilePath == true ||
      this.invalidLogFilePath == true ||
      this.InvalidExistingContainerName == true ||
      this.InvalidExistingHostingName == true
    ) {
      this._toastr.error(CONSTANTS.genericCRUDMsgs.invalidInputs);
    } else {
      let data = this.serviceHostForm.getRawValue();
      if (this.ServiceHostEditing.Name)
        data = _.merge(this.ServiceHostEditing, data);
      data.Name = data.ContainerHostingName || 0;
      data.CreateBy = this._userDetails ? this._userDetails.username : "";
      data.DcsID = data.DCSiteFlag;
      data.ContainerConfigTemplateId = data.ContainerConfigTemplate;
      // if(this.ServiceHostEditing) {
      data.UpdatedBy = this._userDetails ? this._userDetails.username : "";
      // }
      // if(data.ContainerType === 0) {
      //   data.ContainerType=''; }
      data.ContainerType = this.selectedContainerType;
      data.Status = this.selectedStatusType;
      data.LogFilePath = data.LogLocation;
      this.saving = true;
      this._prodSvc.saveServiceHost(data).subscribe(
        response => {
          if (response.data && response.data.Name) {
            const index = this.hosts.findIndex((v: ServiceHostContext) => {
              return v.Name === response.data.Name;
            });
            if (index >= 0) {
              // UPDATE
              this.hosts.splice(index, 1, response.data);
            } else {
              // SAVE
              this.hosts.push(response.data);
            }
          }
          this._getGridData();
          this.serviceHostModal.close();
          this.ServiceHostEditing = null;
          this.serviceHostForm = null;
          this.selectedID = "";
          this.selectedContainerType = "";
          this.selectedDataCenterSiteType = "";
          this.selectedStatusType = "";
          this.selectedContainerConfigID = "";
          this.selectedStatus = "";
          this.invalidIPAddress = false;
          this.InvalidExistingContainerName = false;
          this.InvalidExistingHostingName = false;

          this.saving = false;
          this._toastr.success(
            "Service Host " + CONSTANTS.genericCRUDMsgs.saveSuccess
          );
        },
        err => {
          this.saving = false;
          this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
        }
      );
    }
  };

  public validateIPAddress(elementValue) {
    var IPAddressPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    // /[^ (\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})]+$/;
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
  public PopulateDefaultRootDirPath(env: any) {
    // if(this.InvalidExistingHostingName = true){this.InvalidExistingHostingName = false};
    this.UniqueHostingName(env);
    const ContainerRootDirectoryPreFormated =
      "F:/" + this.serviceHostForm.get("ContainerHostingName").value;
    const ContainerConfigFilePathPreFormatted =
      this.serviceHostForm.get("ContainerRootDirectory").value +
      "/servers.config";
    const AssemblyLocationPreFormatted =
      this.serviceHostForm.get("ContainerRootDirectory").value + "/bin";
    const LogLocationPreFormatted =
      this.serviceHostForm.get("ContainerRootDirectory").value + "/svr.log";

    // let Driveletter =  this.serviceHostForm.get('ContainerRootDirectory').value;
    // Driveletter.split(':/');
    // const LogLocationPreFormatted = Driveletter[0] + 'Logs' + this.serviceHostForm.get('ContainerHostingName').value +  '/svr.log';

    this.serviceHostForm.controls["ContainerRootDirectory"].setValue(
      ContainerRootDirectoryPreFormated.replace(/\//g, "\\")
    );
    this.serviceHostForm.controls["ContainerConfigFilePath"].setValue(
      ContainerConfigFilePathPreFormatted.replace(/\//g, "\\")
    );
    this.serviceHostForm.controls["AssemblyLocation"].setValue(
      AssemblyLocationPreFormatted.replace(/\//g, "\\")
    );
    this.serviceHostForm.controls["LogLocation"].setValue(
      LogLocationPreFormatted.replace(/\//g, "\\")
    );
  }

  public PopulateDefaultConfigFilePath(env: any) {
    const ContainerConfigFilePathPreFormatted =
      this.serviceHostForm.get("ContainerRootDirectory").value +
      "/servers.config";
    const AssemblyLocationPreFormatted =
      this.serviceHostForm.get("ContainerRootDirectory").value + "/bin";
    const LogLocationPreFormatted =
      this.serviceHostForm.get("ContainerRootDirectory").value + "/svr.log";

    this.serviceHostForm.controls["ContainerConfigFilePath"].setValue(
      ContainerConfigFilePathPreFormatted.replace(/\//g, "\\")
    );
    this.serviceHostForm.controls["AssemblyLocation"].setValue(
      AssemblyLocationPreFormatted.replace(/\//g, "\\")
    );
    this.serviceHostForm.controls["LogLocation"].setValue(
      LogLocationPreFormatted.replace(/\//g, "\\")
    );
  }

  public restrictToDirectoryPath(env: any) {
    var regex = new RegExp(
      '^[A-Za-z]:(?:\\\\(?!["*/:?|<>\\\\,;[\\]+=.\\x00-\\x20])[^"*/:?|<>\\\\[\\]]+){0,}(?:\\\\)?$'
    );

    const AssemblyLocation = this.serviceHostForm.get("AssemblyLocation").value;
    const ContainerConfigFilePath = this.serviceHostForm.get(
      "ContainerConfigFilePath"
    ).value;
    const LogLocation = this.serviceHostForm.get("LogLocation").value;

    if (AssemblyLocation == env.target.value) {
      if (regex.test(env.target.value)) {
        this.invalidAssemblyFilePath = false;
      } else {
        this.invalidAssemblyFilePath = true;
      }
    }
    if (ContainerConfigFilePath == env.target.value) {
      if (regex.test(env.target.value)) {
        this.invalidConfigFilePath = false;
      } else {
        this.invalidConfigFilePath = true;
      }
    }
    if (LogLocation == env.target.value) {
      if (regex.test(env.target.value)) {
        this.invalidLogFilePath = false;
      } else {
        this.invalidLogFilePath = true;
      }
    }
  }
  public restrictToAplhaNumericSpace(env: any) {
    if ((this.InvalidExistingContainerName = true)) {
      this.InvalidExistingContainerName = false;
    }
    env.target.value = env.target.value.replace(/[^ A-Za-z0-9]+$/g, "");
  }

  restrictToNumericperiod(env: any) {
    const keyValue = Number(JSON.stringify(env.target.value));

    if (keyValue < 48 || keyValue > 57) {
      if (keyValue == 46) {
      } else {
        this._toastr.error("Invalid data.  Please enter a valid value.");
      }
    }
    env.target.value = env.target.value.replace(/[^0-9.]/g, "");
  }

  public restrictToAplhaNumericSpacefwdslash(env: any) {
    env.target.value = env.target.value.replace(/[^/ A-Za-z0-9]+$/g, "");
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
          let file = this.serviceHostForm.controls["ContainerConfigFilePath"]
            .value;
          this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
          let filePath = String.raw`${file}`.split("\\").join("/");
          let serverName = this.serviceHostForm.controls["ServerName"].value;
          let serverIP = this.serviceHostForm.controls["ServerIP"].value;

          let data = this.configfileXmlForm.getRawValue();
          data.FilePath = filePath;
          data.User = this._userDetails.username;
          data.ServerName = serverName;
          data.ServerIP = serverIP;

          this._prodSvc.saveFileContent(data).subscribe(
            response => {
              this.configfilexmlsaving = false;
              this._toastr.success(
                "Container config " +
                  CONSTANTS.adminsvchostMsgs.saveFileSavedSuccess
              );
              this.configfileXmlModal.close();
            },
            err => {
              this.configfilexmlsaving = false;
              this._toastr.error(
                CONSTANTS.adminsvchostMsgs.failedFileSavedSuccess
              );
              this.configfileXmlModal.close();
            }
          );
        } else {
          this.configfileXmlModal.close();
        }
      });
  }

  public retrieveFileContent() {
    let file = this.serviceHostForm.controls["ContainerConfigFilePath"].value;
    let serverName = this.serviceHostForm.controls["ServerName"].value;
    let serverIP = this.serviceHostForm.controls["ServerIP"].value;
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
  public retrieveLogFileContent() {
    let file = this.serviceHostForm.controls["LogLocation"].value;
    let serverName = this.serviceHostForm.controls["ServerName"].value;
    let serverIP = this.serviceHostForm.controls["ServerIP"].value;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    let filePath = String.raw`${file}`.split("\\").join("/");
    // ExamplePath = "//DCEPPSSOAGWQ1/f/Logs/CPSSOAAPPSVR/svr.log";
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
           this.logfileXml = response.FileContent;
           this.logfileXmlForm.setValue({
            FileContent:response.FileContent 
          });
            this.logfileXmlModal.open();
          } else {
            this._toastr.error("Invalid data. " + response.Message);
          }
        },
        (err: any) => {}
      );
  }
}
