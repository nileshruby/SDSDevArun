import { CONSTANTS } from "@entities/constants";
import {
  Component,
  OnInit,
  ViewEncapsulation,
  QueryList,
  ViewChildren,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import {
  DialogService,
  ProductService,
  SessionService,
  InputValidationService
} from "@app/services";
import { LocalModalComponent } from "@shared/components";
import {
  ProductContext,
  ProductMenuFeature,
  IProductMenuFeature
} from "@entities/models";
import * as _ from "lodash";
import { DialogConfig, DialogTypes } from "@entities/dialog";
import Swal from "sweetalert2";
import { PRODUCT_IDS } from "@app/entities/product-ids";
import { APP_KEYS } from "@app/entities/app-keys";
import { Subscription } from "rxjs";
import { IApiResponseBackend } from "@app/entities/api-response";

@Component({
  selector: "ga-product-maint",
  styleUrls: ["./product-maint.scss"],
  templateUrl: "./product-maint.html",
  encapsulation: ViewEncapsulation.None
})
export class GA_ProductMaintPage implements AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = "GA_ProductMaintPage";
  @ViewChildren("prodModal") prodModalQuery: QueryList<LocalModalComponent>;
  prodModalQuerySubscription: Subscription;
  prodModal: LocalModalComponent;

  public loading = false;
  public saving = false;
  public items: ProductContext[] = null;

  public prodEditing: ProductContext = null;
  public prodForm: FormGroup;
  public ResetFilterboxForm: FormGroup;
  SearchForm: FormGroup;
  isProductCodeDup: boolean = false;
  isIntroduction: boolean = false;
  dropdownSettings = {};
  dropdownList: ProductMenuFeature[] = [];
  features = [];
  cols: any[] = [];
  public IV: InputValidationService = new InputValidationService();
  public menusList: ProductMenuFeature[] = [];
  public isNotGenericMenuList: ProductMenuFeature[] = [];
  constructor(
    private _fb: FormBuilder,
    private _prodSvc: ProductService,
    private _dialogSvc: DialogService,
    private _sessionSvc: SessionService,
    private _toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cols = [
      { field: "productCode", header: "Product Code" },
      { field: "productName", header: "Name" },
      { field: "shortDesc", header: "Short Description" },
      { field: "longDesc", header: "Long Description" },
      { field: "isOffered", header: "Is Offered" }
    ];
    this._getGridData();
    this._getFeatureMenu();
    this.SearchForm = this._fb.group({});
    this.dropdownSettings = {
      singleSelection: false,
      idField: "MenuID",
      textField: "Name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true
    };
    this.dropdownList = [];
    this._buildProdForm();
  }

  ngAfterViewInit() {
    this.prodModalQuerySubscription = this.prodModalQuery.changes.subscribe(
      (prodQuery: QueryList<LocalModalComponent>) => {
        this.prodModal = prodQuery.first;
        this.prodModalQuerySubscription.unsubscribe();
      }
    );
  }

  ngOnDestroy() {
    this.prodModalQuerySubscription.unsubscribe();
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
    // searchText = searchText.toUpperCase();
  }
  public RefreshFilterboxGrid(dataTable: any) {
    this.onSearch("", dataTable);
  }

  public onProdCreateClick = ($event: any) => {
    if (this.prodModal.isOpen) return;
    this.dropdownList = this.menusList;
    this._buildProdForm();
    this.prodModal.open();
  };

  public onProdEditClick = (data: any) => {
    this._buildProdForm(data.data);
    this.prodModal.open();
  };

  public onProdSaveClick = () => {
    if (this.prodForm.invalid) {
      if (this.prodForm.controls["productName"].invalid) {
        this._toastr.error(CONSTANTS.adminprodmaintMsgs.invalidProductName);
      }

      if (this.prodForm.controls["productCode"].invalid) {
        this._toastr.error(CONSTANTS.adminprodmaintMsgs.invalidProductCode);
      }
    } else {
      if (!this.prodEditing.productId) {
        this.isCheckProductCode();
      }

      if (!this.isProductCodeDup) {
        let data = this.prodForm.getRawValue();

        if (this.prodEditing.productId) data = _.merge(this.prodEditing, data);

        data.productId = data.productId || 0;
        let featureMenuString = "";
        if (this.features) {
          this.features.forEach(element => {
            featureMenuString += element.MenuID + ",";
          });
          featureMenuString = featureMenuString.replace(/,\s*$/, "");
        }
        data.FeatureMenu = featureMenuString;

        let fullFeatureMenuString = "";
        if (this.dropdownList) {
          this.dropdownList.forEach(element => {
            fullFeatureMenuString += element.MenuID + ",";
          });
          fullFeatureMenuString = fullFeatureMenuString.replace(/,\s*$/, "");
        }
        data.FullFeatureMenuList = fullFeatureMenuString;

        this.saving = true;
        this._prodSvc.saveProduct(data).subscribe(
          response => {
            if (response.data && response.data.productId) {
              let index = this.items.findIndex((v: ProductContext) => {
                return v.productId === response.data.productId;
              });
              if (index >= 0) {
                // UPDATE
                this.items.splice(index, 1, response.data);
              } else {
                // SAVE
                this.items.push(response.data);
              }
            }
            this.prodModal.close();
            this.prodEditing = null;
            this.prodForm = null;

            this.saving = false;
            this._getGridData();
            this._toastr.success(CONSTANTS.genericCRUDMsgs.saveSuccess);
            let userDetails = this._sessionSvc.get(APP_KEYS.userContext);
            if (userDetails) {
              let updateProduct: any = {
                usrID: userDetails.userId
              };
              updateProduct.products = userDetails.assginedProducts;
              this._prodSvc
                .updateDisplayOrderForUserProduct(updateProduct)
                .subscribe(
                  response => {},
                  err => {}
                );
            }
          },
          err => {
            this.saving = false;
            this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
          }
        );
      }
    }
  };

  public onProdCancelClick = (data: any, node: any) => {
    this.prodModal.close();
    this.prodEditing = null;
    this.prodForm = null;
  };

  public onProdDeleteClick = (data: any, node: any) => {
    if (data.data.productId == PRODUCT_IDS.INTRO) {
      return false;
    }
    //This is general product FI counts but named as getRtpProductStatsCount and being used in other places so not renaming it
    this._prodSvc
      .getRtpProductStatsCount(data.data.productId)
      .subscribe((FICount: IApiResponseBackend) => {
        if (FICount.Data.FiCount > 0) {
          (Swal as any)
            .fire({
              title: CONSTANTS.adminprodmaintMsgs.invalidProductDelete,
              type: "warning",
              showCancelButton: false,
              confirmButtonColor: "#3085d6",
              confirmButtonText: "OK"
            })
            .then(result => {
              if (result.value) {
              }
            });
        } else {
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
                  .deleteProduct(data.data.productId)
                  .subscribe(response => {
                    let index = this.items.findIndex((i: ProductContext) => {
                      return data.data.productId === i.productId;
                    });

                    if (index >= 0) this.items.splice(index, 1);

                    this._toastr.success(
                      CONSTANTS.genericCRUDMsgs.deleteSuccess
                    );
                  });
              }
            });
        }
      });
  };

  private _getFeatureMenu() {
    this._prodSvc.getProductMenuFeature().subscribe(
      response => {
        let featureMenu = response.Data;
        featureMenu.forEach(menuList => {
          this.isNotGenericMenuList.push(menuList);
          if (!menuList.isGeneric) return false;

          this.menusList.push(menuList);
        });
      },
      (err: any) => {}
    );
  }

  private _getGridData() {
    this.loading = true;
    this._prodSvc.getProductList().subscribe(
      response => {
        this.items = response.data;
        // console.log(this.items)
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
      }
    );
  }

  public restrictToAplhaNumericProductCode(env: any) {
    env.target.value = env.target.value
      .replace(/[^A-Za-z0-9]+$/g, "")
      .toUpperCase();
    return this.isCheckProductCode();
  }
  public isCheckProductCode() {
    this.isProductCodeDup = false;
    const productCode = this.prodForm
      .get("productCode")
      .value.replace(/[^A-Za-z0-9]+$/g, "").length;
    if (productCode > 0 && productCode < 2) {
      this._toastr.error(
        CONSTANTS.adminprodmaintMsgs.invalidProductCodeMinimumValidation
      );
      return false;
    }
    if (productCode > 7) {
      this._toastr.error(
        CONSTANTS.adminprodmaintMsgs.invalidProductCodeMaximumValidation
      );
      return false;
    }
    let prcode = this.prodForm
      .get("productCode")
      .value.replace(/[^A-Za-z0-9]+$/g, "");
    let isCheck = this.items.filter((item: ProductContext) => {
      if (!item || !item.productCode) {
        return false;
      }
      if (item.productCode.toUpperCase() == prcode.toUpperCase()) {
        return true;
      }
      return false;
    });
    if (isCheck.length > 0) {
      this.isProductCodeDup = true;
      return false;
    }
    return true;
  }
  private _buildProdForm(product: ProductContext = new ProductContext()) {
    this.isProductCodeDup = false;
    this.prodEditing = product;
    if (this.prodEditing.productId) {
      this.features = [];
      this.dropdownList = [];
      if (
        this.prodEditing.featureMenu ||
        this.prodEditing.fullFeatureMenuList
      ) {
        this.prodEditing.fullFeatureMenuList.split(",").forEach(menuList => {
          let menuID = Number(menuList);
          let droplist = this.isNotGenericMenuList.filter(function(menu) {
            return menu.MenuID == menuID;
          });
          if (droplist.length > 0) {
            this.dropdownList.push(droplist[0]);
          }
        });
        this.prodEditing.featureMenu.split(",").forEach(selectedMenuList => {
          let selectedMenuID = Number(selectedMenuList);
          var filteredArray = this.isNotGenericMenuList.filter(function(
            selectMenu
          ) {
            return selectedMenuID === selectMenu.MenuID;
          });
          if (filteredArray.length > 0) {
            this.features.push(filteredArray[0]);
          }
        });
      }
      this.isIntroduction =
        this.prodEditing.productId == PRODUCT_IDS.INTRO ? true : false;
      this.prodForm = this._fb.group({
        productId: new FormControl(
          this.prodEditing.productId,
          Validators.required
        ),
        productName: new FormControl(
          this.prodEditing.productName,
          Validators.required
        ),
        productCode: new FormControl(
          this.prodEditing.productCode,
          Validators.required
        ),
        shortDesc: new FormControl(this.prodEditing.shortDesc),
        longDesc: new FormControl(this.prodEditing.longDesc),
        isOffered: new FormControl(this.prodEditing.isOffered)
      });
    } else {
      this.prodForm = this._fb.group({
        productId: new FormControl(0, Validators.required),
        productName: new FormControl("", Validators.required),
        productCode: new FormControl("", Validators.required),
        shortDesc: new FormControl(""),
        longDesc: new FormControl(""),
        isOffered: new FormControl(false)
      });
      this.features = this.dropdownList;
      this.isIntroduction = false;
    }
  }
}
