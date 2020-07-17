import {
  async,
  ComponentFixture,
  TestBed,
  getTestBed
} from "@angular/core/testing";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormsModule
} from "@angular/forms";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  DebugElement,
  Component,
  ElementRef
} from "@angular/core";
import {
  DialogService,
  HelpersService,
  HttpBaseService,
  VaultService,
  SessionService,
  LoggingService,
  ProductService,
  AccountService,
  FiService
} from "@app/services";
import { HttpClientModule } from "@angular/common/http";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { LocalModalComponent } from "@app/modules/shared/components";
import {
  ProductContext,
  UserDetailContext,
  ServiceHostContext,
  ServiceInstanceContext,
  FiContext
} from "@app/entities/models";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSelectModule } from "@angular/material/select";
import { By, HAMMER_LOADER } from "@angular/platform-browser";
import * as _ from "lodash";
import { ServiceInstanceComponent } from "./service-instance.component";
import { UserContext } from "@app/entities/user-context";
import { UrlResolver } from "@app/services/url-reolver";
import { SingletonService } from "@app/services/singleton.svc";
import "hammerjs"; // Recommended
import { TableModule } from "primeng/table";
describe("ServiceInstanceComponent", () => {
  let component: ServiceInstanceComponent;
  let fixture: ComponentFixture<ServiceInstanceComponent>;
  let injector;
  let _prodSvc: ProductService;
  let _sessionSvc: SessionService;
  let _toastr: ToastrService;
  let dialogService: DialogService;
  let rowDetailModal: LocalModalComponent;
  let serviceInstanceModal: LocalModalComponent;
  let debugElement: DebugElement;
  let element: HTMLElement;
  let mainframeId: DebugElement;
  let inputEl: DebugElement;
  let dataTable: ElementRef;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceInstanceComponent, LocalModalComponent],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        SweetAlert2Module.forRoot(),
        FormsModule,
        MatSlideToggleModule,
        MatSelectModule,
        TableModule
      ],
      providers: [
        DialogService,
        ProductService,
        HelpersService,
        SessionService,
        HttpBaseService,
        LoggingService,
        VaultService,
        ToastrService,
        AccountService,
        FiService,
        SingletonService,
        UrlResolver,
        {
          provide: HAMMER_LOADER,
          useValue: () => new Promise(() => {})
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceInstanceComponent);
    component = fixture.componentInstance;
    injector = getTestBed();
    _prodSvc = injector.get(ProductService);
    _sessionSvc = injector.get(SessionService);
    _toastr = injector.get(ToastrService);
    dialogService = injector.get(DialogService);
    rowDetailModal = fixture.componentInstance.detailModal;
    serviceInstanceModal = fixture.componentInstance.serviceInstanceModal;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should call ngOnInit function", () => {
      let shc = new ServiceHostContext();
      shc.HscID = 1;
      shc.Name = "test";
      shc.Description = "test d";
      shc.ContainerType = "test type";
      shc.CtrID = 1;
      shc.ServerName = "test server";
      shc.ServerIP = "test ip";
      let data = [shc];
      spyOn(_prodSvc, "RetrieveServiceHosts").and.returnValue(of(data));
      spyOn(_prodSvc, "retrieveConfigTemplateData").and.returnValue(of(data));
      spyOn(_prodSvc, "retrieveDictionaryData").and.returnValue(of(data));
      component.ngOnInit();
      expect(component.ServiceHostList[0].HscID).toEqual(1);
    });
  });

  describe("onSearch", () => {
    it("should call on Search function on search any keyword time and return search result.", () => {
      let shc = new ServiceInstanceContext();
      shc.HscID = 1;
      shc.ProductName = "test";
      shc.ServiceHost = "test d";
      shc.ServiceInstanceID = "1";
      shc.SviID = 1;
      shc.PrdID = 1;
      shc.ServiceDescription = "test server";
      shc.isRestartProcess = false;
      component.instances = [shc];
      component.onSearch("1", dataTable);
      expect(component.instances[0].ProductName).toEqual("test");
    });
  });

  describe("retrieveServiceHosts", () => {
    it("should return Service Host. When the retrieveServiceHosts () function is called", () => {
      let shc = new ServiceHostContext();
      shc.HscID = 1;
      shc.Name = "test";
      shc.Description = "test d";
      shc.ContainerType = "test type";
      shc.CtrID = 1;
      shc.ServerName = "test server";
      shc.ServerIP = "test ip";
      let data = [shc];
      spyOn(_prodSvc, "RetrieveServiceHosts").and.returnValue(of(data));
      component.ngOnInit();
      expect(component.ServiceHostList[0].HscID).toEqual(1);
    });
  });

  describe("onServiceInstanceSaveClick", () => {
    it("should return Invalid data error. if icaForm invalid", () => {
      component.serviceInstanceForm.setValue({
        ServiceHost: "",
        Product: "Card Maintenance",
        ServiceInstanceID: 1,
        ServiceDescription: "test",
        Command: "STOP",
        ServiceVersion: "test",
        TcpChannelName: "",
        TcpServerIP: "",
        TcpPort: "",
        Status: "",
        ReloadAppFile: "",
        ApplicationModule: "",
        MessagingTransformType: "",
        MessagingSettingFile: "",
        IsoSpecfication: "",
        ServiceChannelName: "",
        ServiceURI: "",
        ServiceContractType: "",
        ServiceChannelName2: "",
        ServiceURI2: "",
        ServiceChannelName3: "",
        ServiceURI3: "",
        ServiceConfigTemplateId: "",
        LogConfigTemplateId: "",
        FIName: "",
        ServiceChannelType: "",
        LogFilePath: ""
      });
      component.productId = 2;
      const spyDisplayToastMsg = spyOn(_toastr, "error").and.stub();
      component.onServiceInstanceSaveClick();
      expect(component.serviceInstanceForm.invalid).toBe(true);
      console.log(component);
      expect(spyDisplayToastMsg).toHaveBeenCalled();
    });

    it("should have the  onServiceInstanceSaveClick being called when the form is submited.", () => {
      let udata = new UserContext();
      udata.isAuthenticated = true;
      udata.assginedProducts = [];
      udata.userId = 1;
      udata.username = "test";
      component._userDetails = udata;

      spyOn(_sessionSvc, "get").and.returnValue(of(udata));
      component.Reloadapptouched = true;
      component.ServiceInstanceEditing = new ServiceInstanceContext();

      component.serviceInstanceForm.setValue({
        ServiceHost: "1",
        Product: "Card Maintenance",
        ServiceInstanceID: 1,
        ServiceDescription: "test",
        Command: "STOP",
        ServiceVersion: "test",
        TcpChannelName: "test",
        TcpServerIP: "test",
        TcpPort: "test",
        Status: "test",
        ReloadAppFile: "test",
        ApplicationModule: "test",
        MessagingTransformType: "test",
        MessagingSettingFile: "test",
        IsoSpecfication: "test",
        ServiceChannelName: "test",
        ServiceURI: "test",
        ServiceContractType: "test",
        ServiceChannelName2: "test",
        ServiceURI2: "test",
        ServiceChannelName3: "test",
        ServiceURI3: "test",
        ServiceConfigTemplateId: "test",
        LogConfigTemplateId: "test",
        FIName: "test",
        LogFilePath: "c:/test",
        ServiceChannelType: "test"
      });
      component.productId = 2;
      component.selectedServiceHostID = 1;
      component.selectedHostType = "host test";
      const spyDisplayToastMsg = spyOn(_toastr, "success").and.stub();
      let date = new Date();
      let response = { expiration: date, errorMessages: [], flags: [] };
      const spyOnSave = spyOn(_prodSvc, "saveServiceInstance").and.returnValue(
        of(response)
      );
      component.onServiceInstanceSaveClick();
      component.serviceInstanceModal.close();
      expect(spyOnSave).toHaveBeenCalled();
      expect(component.serviceInstanceForm).toEqual(null);
      expect(spyDisplayToastMsg).toHaveBeenCalled();
    });
  });

  describe("onServiceInstancecreateClick", () => {
    it("should open create form modal. When the onServiceInstancecreateClick() function is called", () => {
      component.onServiceInstancecreateClick("");
      expect(component.serviceInstanceModal.isOpen).toEqual(true);
    });
  });

  describe("isCardMaintainanceProduct", () => {
    it("should check CRDMNT product code", () => {
      component.productCode = "CRDMNT";
      let repo = component.isCardMaintainanceProduct();
      expect(repo).toEqual(true);
    });
  });

  describe("onServiceInstanceCancelClick", () => {
    it("should open close modal. When the onServiceInstanceCancelClick() function is called", () => {
      component.onServiceInstanceCancelClick("", "");
      expect(component.serviceInstanceModal.isOpen).toEqual(false);
    });
  });

  describe("onExpandView", () => {
    it("should open modal and show details. When the onExpandView() function is called", () => {
      component.instances = [
        { SviID: 2, FINames: null, isRestartProcess: true },
        { SviID: 1, FINames: null, isRestartProcess: true }
      ];
      component.onExpandView({ data: { SviID: 1, FINames: null } });
      expect(component.childindex).toEqual(1);
      expect(component.detailModal.isOpen).toEqual(true);
    });
  });

  describe("onServiceInstanceDetailCloseClick", () => {
    it("should close modal. When the onServiceInstanceDetailCloseClick() function is called", () => {
      component.onServiceInstanceDetailCloseClick();
      expect(component.detailModal.isOpen).toEqual(false);
    });
  });

  describe("onServiceInstanceEditClick", () => {
    it("should open edit form modal. When the onServiceInstanceEditClick() function is called", () => {
      let shc: any = {};
      shc.SviID = 12;
      shc.ServiceHost = "localhost";
      shc.ServiceInstanceID = "1";
      shc.ServiceDescription = "jhl l";
      shc.ProductName = "Card";
      shc.TcpChannelName = "test j";
      shc.TcpServerIP = "111.11.11.11";
      shc.TcpPort = "26589";
      shc.Status = "";
      shc.Command = "";
      shc.ReloadAppFile = "";
      shc.ApplicationModule = "t";
      shc.MessagingTransformType = "sdf";
      shc.MessagingSettingFile = "sdf";
      shc.IsoSpecfication = "ios";
      shc.ServiceChannelName = "";
      shc.ServiceURI = "";
      shc.ServiceContractType = "";
      shc.ServiceChannelName2 = "";
      shc.ServiceURI2 = "";
      shc.ServiceChannelName3 = "";
      shc.ServiceURI3 = "";
      shc.ServiceConfigTemplateId = "1";
      shc.LogConfigTemplateId = "";
      shc.ServiceVersion = "";
      shc.FIAssignedList = [];
      shc.FIID = 1;

      let data = { data: shc };
      component.onServiceInstanceEditClick(data);
      expect(component.serviceInstanceModal.isOpen).toEqual(true);
      console.log(component.serviceInstanceForm);
      expect(component.serviceInstanceForm.value.TcpServerIP).toEqual(
        "111.11.11.11"
      );
    });
  });

  describe("getStatusTypeId", () => {
    it("should getStatusTypeId() function is called", () => {
      component.StatusList = [
        {
          DictValue: "stest",
          DictID: 12
        }
      ];
      component.getStatusTypeId("stest");
      expect(component.selectedStatus).toEqual(12);
    });
  });

  describe("getAppModuleId", () => {
    it("should getAppModuleId() function is called", () => {
      component.AppModuleList = [
        {
          DictValue: "testapp",
          DictID: 123
        }
      ];
      component.getAppModuleId("testapp");
      expect(component.selectedApplicationModule).toEqual(123);
    });
  });

  describe("getMsgTransTypeId", () => {
    it("should getMsgTransTypeId() function is called", () => {
      component.MessageTransformList = [
        {
          DictValue: "testapp",
          DictID: 123
        }
      ];
      component.getMsgTransTypeId("testapp");
      expect(component.selectedMessagingTransformType).toEqual(123);
    });
  });

  describe("getMsgSettingFileTypeId", () => {
    it("should getMsgSettingFileTypeId() function is called", () => {
      component.MessageSettingList = [
        {
          DictValue: "testapp",
          DictID: 123
        }
      ];
      component.getMsgSettingFileTypeId("testapp");
      expect(component.selectedMsgSettingFile).toEqual(123);
    });
  });

  describe("getIsoSpecificationTypeId", () => {
    it("should getIsoSpecificationTypeId() function is called", () => {
      component.IsoSpecificationList = [
        {
          DictValue: "testapp",
          DictID: 123
        }
      ];
      component.getIsoSpecificationTypeId("testapp");
      expect(component.selectedIsoID).toEqual(123);
    });
  });

  describe("getHostId", () => {
    it("should getHostId() function is called", () => {
      component.ServiceHostList = [
        {
          Name: "testapp",
          HscID: 123
        }
      ];
      component.getHostId("testapp");
      expect(component.selectedServiceHostID).toEqual(123);
    });
  });

  describe("FISelectedOne", () => {
    it("should FISelectedOne() function is called", () => {
      let fi1: FiContext = {};
      fi1.fiId = 1;
      fi1.fiName = "test 1";

      let fi2: FiContext = {};
      fi2.fiId = 2;
      fi2.fiName = "test 2";

      component.fiList = [fi1, fi2];

      component.FISelectedOne({ FIID: 3 });
      expect(component.FISSelected.length).toEqual(0);
    });
  });
});
