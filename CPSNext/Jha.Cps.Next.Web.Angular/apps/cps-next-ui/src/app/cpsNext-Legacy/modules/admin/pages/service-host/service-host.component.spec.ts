import { of } from 'rxjs';
import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { ServiceHostComponent } from './service-host.component';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { LocalModalComponent} from '@shared/components';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { DialogService, ProductService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, AccountService} from '@app/services';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as _ from 'lodash';
import { UrlResolver } from '@app/services/url-reolver';
import {ServiceHostContext} from '@entities/models';
import { UserContext } from '@app/entities/user-context';
import { SingletonService } from '@app/services/singleton.svc';
import { TableModule } from 'primeng/table';

describe('ServiceHostComponent', () => {
  let component: ServiceHostComponent;
  let fixture: ComponentFixture<ServiceHostComponent>;
  let injector;
  let productService: ProductService;
  let toastrService: ToastrService;
  let dialogService: DialogService;
  let ServiceHostModal: LocalModalComponent;
  let configfileXmlModal: LocalModalComponent;
  let logfileXmlModal: LocalModalComponent;
  let debugElement: DebugElement;
  let element: HTMLElement;
  let _sessionSvc: SessionService;
  let datatable: ElementRef;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceHostComponent,
        LocalModalComponent,
         ],
        imports: [
            CommonModule,
            ReactiveFormsModule,
            HttpClientTestingModule,
            HttpClientModule,
            ToastrModule.forRoot(),
            FormsModule,
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
            UrlResolver,
            SingletonService
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ],  
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceHostComponent);
    component = fixture.componentInstance;
    injector        = getTestBed();
    productService  = injector.get(ProductService);
    toastrService   = injector.get(ToastrService);
    dialogService   = injector.get(DialogService);
    _sessionSvc     = injector.get(SessionService);
    ServiceHostModal = fixture.componentInstance.serviceHostModal;
    configfileXmlModal = fixture.componentInstance.configfileXmlModal;
    logfileXmlModal = fixture.componentInstance.logfileXmlModal;
    ServiceHostModal = fixture.componentInstance.serviceHostModal;
    debugElement    = fixture.debugElement;
    element         = debugElement.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onServiceHostSaveClick', () => {
    it('should return Invalid data error. if serviceHostForm id invalid', () => {
        let udata = new UserContext();
            udata.isAuthenticated = true;
            udata.assginedProducts = [];
            udata.userId = 1;
            udata.username = 'test';
        spyOn(_sessionSvc, 'get').and.returnValue(of(udata));
        component._userDetails = udata;

        const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
        component.serviceHostForm = new FormGroup({
            DCSiteFlag: new FormControl('', Validators.required),
            ServerName: new FormControl('', Validators.required),
            ServerIP: new FormControl('', Validators.required),
            ContainerName: new FormControl('', Validators.required),
            Description: new FormControl(''),
            Status: new FormControl('', Validators.required),
            ContainerType: new FormControl('', Validators.required),
            ContainerHostingName: new FormControl('', Validators.required),
            ContainerRootDirectory:new FormControl('', Validators.required),
            ContainerConfigFilePath:new FormControl('', Validators.required),
            ContainerConfigTemplate:new FormControl(''),
            LogLocation:new FormControl(''),
            AssemblyLocation:new FormControl('')
          });
        component.onServiceHostSaveClick();
        expect(component.serviceHostForm.invalid).toBe(true);
        expect(spyDisplayToastMsg).toHaveBeenCalled();
    });
    it('should have the saveHost being called when the form is submited', () => {
      let udata = new UserContext();
            udata.isAuthenticated = true;
            udata.assginedProducts = [];
            udata.userId = 1;
            udata.username = 'test';
        spyOn(_sessionSvc, 'get').and.returnValue(of(udata));
        component._userDetails = udata;

        let sh = new ServiceHostContext();
        sh.SiteName = 'ATX';
        sh.ServerName = 'test';
        sh.ServerIP = 'test';
        sh.ContainerName = 'test';
        sh.Description = 'test';
        sh.Status = 'INSTALLED';            
        sh.ContainerType = 'IIS';  
        sh.Name = 'test';  
        sh.ContainerRootDirectory = 'test';  
        sh.ContainerConfigFilePath = 'test';  
        sh.ContainerConfigTemplateId = 3;  
        sh.LogFilePath = 'test';  
        sh.AssemblyLocation = 'test';  
        sh.HscID = 1;
        component.hosts = [sh];
       
       // component.serviceHostForm.setValue({HscID:1 ,DCSiteFlag: 'ATX',ServerName: 'TestServerName', ServerIP: '10.226.138.113', ContainerName: 'TestContainerName', Description: 'TestDesc',Status: 'INSTALLED',ContainerType: 'IIS',ContainerHostingName: 'TestName',ContainerRootDirectory: 'TestRootDirectory',ContainerConfigFilePath: 'TestConfigFile',ContainerConfigTemplate: 'test',LogLocation: 'Test',AssemblyLocation: 'Log'});
        component.serviceHostForm = new FormGroup({
            DCSiteFlag: new FormControl('ATX'),
            ServerName: new FormControl('TestServerName'),
            ServerIP: new FormControl('1.1.1.1'),
            ContainerName: new FormControl('test'),
            Description: new FormControl('TestDesc'),
            Status: new FormControl('INSTALLED'),
            ContainerType: new FormControl('Test'),
            ContainerHostingName: new FormControl('TestHostName'),
            ContainerRootDirectory:new FormControl('Testroot'),
            ContainerConfigFilePath:new FormControl('TestFile'),
            ContainerConfigTemplate:new FormControl('Test'),
            LogLocation:new FormControl('Test'),
            AssemblyLocation:new FormControl('Test')
          });
        component.ServiceHostEditing = new ServiceHostContext;
        
        let data = new ServiceHostContext();
            data.SiteName = 'ATX';
            data.ServerName = 'test';
            data.ServerIP = 'test';
            data.ContainerName = 'test';
            data.Description = 'test';
            data.Status = 'INSTALLED';            
            data.ContainerType = 'IIS';  
            data.Name = 'test';  
            data.ContainerRootDirectory = 'test';  
            data.ContainerConfigFilePath = 'test';  
            data.ContainerConfigTemplateId = 3;  
            data.LogFilePath = 'test';  
            data.AssemblyLocation = 'test';  
            data.HscID = 1;

        let date = new Date();
        let response = {data:data, "expiration": date, "errorMessages": [], "flags": [] }
        let spyOnSaveHost = spyOn(productService, 'saveServiceHost').and.returnValue(of(response));
        component.onServiceHostSaveClick();
        component.serviceHostModal.close();
        expect(spyOnSaveHost).toHaveBeenCalled();
    });
});

describe('onServiceHostcreateClick', () => {
    it('should return. if modal is already opened. and if the modal is not open so should  open', () => {
        component.onServiceHostcreateClick();
        expect(component.serviceHostModal.isOpen).toEqual(true);
    });
});

describe('onServiceHostEditClick', () => {
    it('should have the edit product when the form is onProdEditClick', () => {
        let data = new ServiceHostContext();
        data.SiteName = 'ATX';
        data.ServerName = 'test';
        data.ServerIP = 'test';
        data.ContainerName = 'test';
        data.Description = 'test';
        data.Status = 'INSTALLED';            
        data.ContainerType = 'IIS';  
        data.Name = 'test';  
        data.ContainerRootDirectory = 'test';  
        data.ContainerConfigFilePath = 'test';  
        data.ContainerConfigTemplateId = 3;  
        data.LogFilePath = 'test';  
        data.AssemblyLocation = 'test'; 
        let serviceHost = {data:data}
        component.onServiceHostEditClick(serviceHost);
        expect(component.ServiceHostEditing.HscID).toBe(serviceHost.data.HscID);
    });
});

describe('onSearch', () => {
    it('should have the search product and if the search string is empty so return undefined', () => {
        let search = '';
        expect(component.onSearch(search, datatable)).toBeUndefined();
    });

    it('should have the search host and if the search string is xxx so set item list', () => {
        let serviceHost1 = new ServiceHostContext();
        serviceHost1.ContainerName = 'test';
        serviceHost1.ServerName = 'test';
        let serviceHost2 = new ServiceHostContext();
        serviceHost2.ContainerName = 'test2';
        serviceHost2.ServerName = 'test2';
        component.hosts = [serviceHost1, serviceHost2];
        expect(component.onSearch('test', datatable)).toBeUndefined();
    });
});

});
