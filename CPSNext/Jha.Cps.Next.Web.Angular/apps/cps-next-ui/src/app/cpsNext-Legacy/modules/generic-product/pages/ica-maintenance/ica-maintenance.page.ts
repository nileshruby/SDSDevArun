import { CONSTANTS } from '@entities/constants';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {Component, OnInit, ViewChildren, QueryList, AfterViewInit, OnDestroy} from '@angular/core';
import { UserContext } from '@app/entities/user-context';
import { APP_KEYS } from '@app/entities/app-keys';
import * as _ from 'lodash';
import {LoggingService, ProductService, SessionService} from '@app/services';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { LocalModalComponent } from '@app/modules/shared/components';
import { max } from 'rxjs/operators';
import beautify from 'xml-beautifier';
import { ICardICA, ServiceHostContext } from '@app/entities/models';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ica-maintenance',
  templateUrl: './ica-maintenance.html',
  styleUrls: ['./ica-maintenance.scss']
})

export class ICAMaintenancePage implements OnInit,AfterViewInit,OnDestroy {
  protected readonly CLASSNAME = 'ICAMaintenancePage';
  
  @ViewChildren('MasterCardICAModal') MasterCardICAModalQuery: QueryList<LocalModalComponent>;
  MasterCardICAModalSubscription: Subscription;  
  MasterCardICAModal: LocalModalComponent;

  public loading = false;
  public saving = false;
  public items: ICardICA[] = [];
  public formattedXml =  beautify(`<?xml version="1.0" encoding="UTF-8"?><breakfast_menu><food><name>Belgian Waffles</name><price>$5.95</price><description>Two of our famous Belgian Waffles with plenty of real maple syrup</description><calories>650</calories></food><food><name>Strawberry Belgian Waffles</name><price>$7.95</price><description>Light Belgian waffles covered with strawberries and whipped cream</description><calories>900</calories></food><food><name>Berry-Berry Belgian Waffles</name><price>$8.95</price><description>Light Belgian waffles covered with an assortment of fresh berries and whipped cream</description><calories>900</calories></food><food><name>French Toast</name><price>$4.50</price><description>Thick slices made from our homemade sourdough bread</description><calories>600</calories></food><food><name>Homestyle Breakfast</name><price>$6.95</price><description>Two eggs, bacon or sausage, toast, and our ever-popular hash browns</description><calories>950</calories></food></breakfast_menu>
`);
  public prodEditing: ICardICA = new ICardICA();
  public ICATypeList:ServiceHostContext[] = [];
  public icaForm: FormGroup;
  public ResetFilterboxForm: FormGroup;
  public newICA = false;
  public ICAEditing =  false;
  public _userDetails: UserContext = null;
  icaNumError = false;
  public productCode;
  public aProduct;
  public prodId = 0;
  SearchForm: FormGroup;
  selectedICATypeID = 0;
  selectedICATempType:string = '';
  cols: any[]=[];
  ICAList:any = [];
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
        let prod = _.filter(this._userDetails.assginedProducts, (prod) => prod.productCode === this.productCode);
        this.aProduct = prod[0];
        this.prodId = this.aProduct.productId;
      }
    }


  ngOnInit() {
    this.cols = [
      { field: 'ICA', header: 'ICA #' },
      { field: 'ICA_Description', header: 'ICA Description' },
      { field: 'ICA_Type', header: 'ICA Type' },
    ];
    this.retrieveICaTypes();
    this._getGridData();
    this._buildICAForm();
    this.newICA = false;
    this.ICAEditing = false;
    this.SearchForm = this._fb.group({});
  }

  ngAfterViewInit() {
    this.MasterCardICAModalSubscription = this.MasterCardICAModalQuery.changes.subscribe(
      (MasterCardICAQuery: QueryList<LocalModalComponent>) => {
        this.MasterCardICAModal = MasterCardICAQuery.first;
        this.MasterCardICAModalSubscription.unsubscribe();
      }
    );
   
  }
  ngOnDestroy() {
    this.MasterCardICAModalSubscription.unsubscribe();
  }
  public retrieveICaTypes()
  {
    this._prodSvc.retrieveDictionaryData('IcaType').subscribe(    
      response => {
        if(response && response.length > 0) {
          response.forEach((container:ServiceHostContext) => 
          {
            this.ICATypeList.push(container);
            console.debug(this.ICATypeList);
          });
        }
      },
      (err: any) => {
      });
    }
    public ICATypeChange(CTList) {
      this.selectedICATypeID = CTList.target.value
      let selectedConfigTemplateOptions = event.target['options'];
      let selectedCTIndex = selectedConfigTemplateOptions.selectedIndex;
      let selectCTElementText = selectedConfigTemplateOptions[selectedCTIndex].text;
      this.selectedICATempType =  selectCTElementText;
     }
    public getICATypeId(containerType: string){
      let i = 0;
      let containerTypeId = 0;
      for (i = 0; i <= this.ICATypeList.length - 1; i ++) {
        if(this.ICATypeList[i].DictValue == containerType)
        {
          containerTypeId = this.ICATypeList[i].DictID;
        }
       }
      this.selectedICATypeID = containerTypeId;
    }
   
    public RefreshFilterboxGrid(dataTable: any) {
      this.onSearch('', dataTable);
    }
    filterTimeout= null;
    public onSearch(searchText: string, datatable: any): void {
      if(this.filterTimeout) {
        clearTimeout(this.filterTimeout);
      }
      this.filterTimeout = setTimeout(()=>{
          if (datatable) {
          datatable.filterGlobal(searchText, 'contains')
        }
      },250);
      if (datatable) {
        datatable.filterGlobal(searchText, 'contains')
      }
    //  searchText = searchText.toUpperCase();
    }
    private _getGridData() {
      this._prodSvc.getICAMaintenance().subscribe( response =>
        {
          if(response) {
            this.items = response;
            this.ICAList = this.items;
          }
        });
    }

    public onICAEditClick = (data: any) => {
      this.ICAEditing = true;
      this.newICA = false;
      this.getICATypeId(data.data.ICA_Type);
      this._buildICAForm(data.data);
      this.MasterCardICAModal.open();
    }
    
    public onICACreateClick() {
      if(this.MasterCardICAModal.isOpen) {
        this.MasterCardICAModal.close();
      }
      this.selectedICATypeID = 0;
      this.ICAEditing = false;
      this.newICA = true;
      this._buildICAForm(null);
      this.MasterCardICAModal.open();
    }
    onICASaveClick() {
      let data = this.icaForm.getRawValue();
      if (this.icaForm.invalid || this.selectedICATypeID == 0 || this.icaNumError == true) {
        this._toastr.error(CONSTANTS.genericCRUDMsgs.invalidInputs);
      } else {
        const isNotANumber = Number.isNaN(Number(data.ICA));
        if (isNotANumber){
          this._toastr.error(CONSTANTS.quarterlyReportingICAmaintMsgs.invalidICAValue);
        } else {
          data.ICA_Type = this.selectedICATempType;
          data.CreateBy = this._userDetails.username;
          data.UpdateBy = this._userDetails.username;
          this._prodSvc.saveICAMaintenance(data).subscribe(
            response => {
              if(response.Add_Update){
              if (data.ICAID) {
                this._toastr.success(CONSTANTS.quarterlyReportingICAmaintMsgs.updateICA);
              } else {
                this._toastr.success(CONSTANTS.quarterlyReportingICAmaintMsgs.saveICA);
              }
              this._getGridData();
              this.MasterCardICAModal.close();
              this.selectedICATypeID = 0;
            }else{
              this.saving = false;
              this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailedDuplicate);
            }
            },
            err => {
              this.saving = false;
              this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
            });
        }
      }
      
    }

    public onICACancelClick() {
      this.newICA = false;
      if(this.MasterCardICAModal.isOpen) {
        this.ICAEditing = false;
        this.MasterCardICAModal.close();
        this.icaForm.reset();
        let obj = this.icaForm.value;
        Object.keys(obj).forEach(key=>{

          var attr = $('[formcontrolname="'+key+'"]').attr('inputvalidate');
          if (typeof attr !== typeof undefined) {
            $('[formcontrolname="'+key+'"]').css("border", "1px solid #ccc");
            $('.'+key).remove();
          } else {
            // var attr = $('[formcontrolname="'+key+'"]').attr('secureInputValidate');
            // if (typeof attr !== typeof undefined) {
            //   $('[formcontrolname="'+key+'"]').css("border", "1px solid #ccc");
            //   $('.'+key).remove();
            // }
          }
       });
      }
    }

    public onICADeleteClick = (data: any, node: any) => {
  
      (Swal as any).fire({
        title: CONSTANTS.genericCRUDMsgs.deleteConfirm,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {
          this._prodSvc.deleteICA(data.data.ICAID).subscribe(
          response => {
            if (response) {
              (Swal as any).fire(
                'Deleted!',
                'ICA deleted successfully!',
                'success'
              );
              this._getGridData();
            }
          });
        }
      });
    }
  
    collaspeAll() {
    }

    private _buildICAForm(formICA: ICardICA = new ICardICA()) {
      this.prodEditing = formICA;
      if (this.ICAEditing && this.prodEditing.ICAID) {
        this.icaForm = this._fb.group({
          ICAID: new FormControl(this.prodEditing.ICAID, Validators.required),
          ICA: new FormControl(this.prodEditing.ICA, Validators.required),
          ICA_Description: new FormControl(this.prodEditing.ICA_Description),
          ICA_Type: new FormControl(this.prodEditing.ICA_Type, Validators.required)
        });
      }
      else {
        this.icaForm = this._fb.group({
          ICAID: new FormControl(0, Validators.required),
          ICA: new FormControl('', Validators.required),
          ICA_Description: new FormControl(''),
          ICA_Type: new FormControl('0', Validators.required)
        });
      }
    }
    public restrictToNumeric(env: any)
    {
      let value = this.icaForm.value.ICA; //env.target.value;
      const isNotANumber = Number.isNaN(Number( value ));
      if(isNotANumber && (env.key !== 'Backspace' && env.keyCode !==9 && env.keyCode !== 37 && env.keyCode !== 39 
          && env.keyCode!== 17 && env.keyCode !== 65)) {
        this._toastr.error(CONSTANTS.genericCRUDMsgs.invalidValue);
      } 
      if (!isNotANumber && value.length <= 3) {
        this.icaNumError = true;
      } else {
        this.icaNumError = false;
      }
    }
}
