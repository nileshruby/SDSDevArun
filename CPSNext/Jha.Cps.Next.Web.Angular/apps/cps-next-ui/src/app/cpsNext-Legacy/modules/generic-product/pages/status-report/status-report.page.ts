import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {HelpersService, LoggingService, ProductService, SessionService} from '@app/services';
import {IProductActivitySearch, IStatusReport} from '@entities/models';
import * as moment from 'moment';
import * as _ from 'lodash';
import { UserContext } from '@app/entities/user-context';
import { ActivatedRoute } from '@angular/router';
import { APP_KEYS } from '@app/entities/app-keys';

@Component({
  selector: 'status-report',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './status-report.html',
  styleUrls: ['./status-report.scss']
})

export class StatusReportPage implements OnInit {
  protected readonly CLASSNAME = 'StatusReportPage';
  private readonly MAX_DATE_RANGE = 7;
  public loading = false;
  public items: IStatusReport[] = [];
  public searchForm: FormGroup;
  public filterText = '';
  public lastSearchParams: IProductActivitySearch = null;
  public productCode;
  public aProduct;
  public prodId = 0;
  public _userDetails: UserContext = null;
  cols: any[]=[];
  ptableList:any = [];
  constructor(private _fb: FormBuilder,
              private _productSvc: ProductService,
              private _toastr: ToastrService,
              private _helpers: HelpersService,
              private _sessionSvc: SessionService,
              private rout: ActivatedRoute,
              private _log: LoggingService) {
    this.productCode = this.rout.parent.snapshot.params.param;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (this._userDetails && this._userDetails.assginedProducts) {
      let prod = _.filter(this._userDetails.assginedProducts, (prod) => prod.productCode === this.productCode);
      this.aProduct = prod[0];
      this.prodId = this.aProduct.productId;
    }
    // this._initGridConfig();
  }

  ngOnInit() {
    this._buildSearchForm();

    // DATE RANGE TEST
    // this.searchType = 'DATE';
    // this._searchLogs({
    //   serviceId: 'PSCUDXSVC_01',
    //   startDate: moment('2018/08/20').set({
    //     hour: 0,
    //     minute: 0,
    //     second: 0,
    //     millisecond: 0
    //   }),
    //   endDate: moment('2018/08/24').set({
    //     hour: 0,
    //     minute: 0,
    //     second: 0,
    //     millisecond: 0
    //   }),
    //   bin: '545979******',
    //   pan: '2906'
    // });
    this.cols = [
      { field: 'id', header: '#' },
      { field: 'text', header: 'Log' },
      { field: 'timeStamp', header: 'Time Stamp' }
    ];
  }

  public onSearchFormSubmit($event: any) {
    this._searchLogs();
  }

  public onFormReset() {
    if (!this.searchForm)
      return;

    try {
      this.searchForm.controls['startDate'].setValue(moment());
      this.searchForm.controls['endDate'].setValue(moment());
    }
    catch (err) {
    }
  }

  public onDateChange(type: string) {
    if (type === 'start') {
    }
    else if (type === 'end') {
    }
  }


  private _searchLogs() {
    if (!this.searchForm.valid){
    }

    let model = this.searchForm.value;

    this._log.debug(`${this.CLASSNAME} > _searchLogs() > model: `, model);

    // this.lastSearchParams = _.merge({searchType: this.searchType}, model);
    // this.loading = true;
    // this._productSvc.searchServiceActivity(model).subscribe(
    //   response => {
    //     let res: IProductActivitySearchResults = response.data || null;
    //
    //     if (res && res.items && res.items.length) {
    //       this.items = res.items;
    //
    //       this.items.forEach((item: IProductActivity, i: number) => {
    //         item.id = i;
    //       });
    //
    //       this.filterText = '';
          // this.ptableList = this.items;
    //     }
    //
    //     this.loading = false;
    //   },
    //   () => {
    //     this.loading = false;
    //   });
  }
  private _buildSearchForm() {
    this.searchForm = this._fb.group({
      startDate: new FormControl(moment()),
      endDate: new FormControl(moment())
    });
  }
}
