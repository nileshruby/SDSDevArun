import { UserContext } from "./../../../../entities/user-context";
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  ViewEncapsulation,
  QueryList,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import {
  DialogService,
  ProductService,
  LoggingService,
  SessionService,
  InputValidationService,
} from "@app/services";
import { LocalModalComponent } from "@shared/components";
import { UserDetailContext, FiContext } from "@entities/models";
import { CONSTANTS } from "@entities/constants";
import { AccountService } from "@services/account.svc";
import { FiService } from "@services/fi.svc";
import * as _ from "lodash";
import { PRODUCT_IDS } from "@entities/product-ids";
import { ProductContext } from "@entities/models";
import { APP_KEYS } from "@entities/app-keys";
import Swal from "sweetalert2";
import { Subscription } from "rxjs";
import { IfStmt } from "@angular/compiler";

@Component({
  selector: "app-adminuser-maint",
  templateUrl: "./adminuser-maint.component.html",
  styleUrls: ["./adminuser-maint.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AdminuserMaintComponent
  implements OnInit, AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = "AdminuserMaintComponent";
  @ViewChildren("adminUserModal") adminUserModalQuery: QueryList<
    LocalModalComponent
  >;
  adminUserModalSubscription: Subscription;
  adminUserModal: LocalModalComponent;
  public loading = false;
  public saving = false;
  public adminUserForm: FormGroup;
  public ResetFilterboxForm: FormGroup;
  SearchForm: FormGroup;
  public users: UserDetailContext[] = [];
  public usersData = [];
  public UserEditing: UserDetailContext = null;
  public UserEditingReadOnly: UserDetailContext = null;

  public productFiIDs: number[] = [];
  public productFiList: FiContext[] = [];
  public fiSelectList: FiContext[] = [];
  public fiList: FiContext[] = [];
  public usernameinput = "";
  public useremailinput = "";
  public ResetuserId = 0;
  public currentUserId = 0;
  public slectedFIproducts: ProductContext[] = null;
  public intialvalue = 0;
  public NoSpace = 0;
  public prodList: ProductContext[] = [];
  public _userDetails: UserContext = null;
  public newprodList: ProductContext[] = [];
  public IV: InputValidationService = new InputValidationService();

  public loadingFIDs = false;
  userlockState = false;
  lockStatus = "Unlock";
  SecondaryAuthUser = false;
  public selectedFIID = 0;
  public selectedProdsinlist: ProductContext[] = [];
  public productId = 0;
  public UsrSelectedProds: ProductContext[] = [];
  public selectedFIName = "";
  public HighlightedProducts: ProductContext[] = [];
  public userEmail = "";
  public duplicateuser = false;
  public duplicateemail = false;
  public Confirmduplicateemail = "";
  public totalproductcount: number;
  public usernameAvailability = "";
  public emailAvailability = "";
  public lockuserStatus = false;
  public lockSecondaryuserStatus = false;
  invalidPhoneAltLength = false;
  invalidPhoneLength = false;
  invalidSecondaryPhoneLength = false;
  invalidEmail = false;
  showLoading = false;
  dropdownSettings = {};
  FIdropdownList = [];
  dropdownList = [];
  ProductAssignedselected: any = [];
  FidropdownSettings = {};
  FiSelect: any = [];
  paSelected = [];
  lepChange: any = [];
  cols: any[] = [];
  expandedRows: any[] = [];
  userMaintList: any = [];
  userSelectedProductList: any = [];
  globalsavesearchtext = "";
  constructor(
    private _fb: FormBuilder,
    private _accountSvc: AccountService,
    private _prodSvc: ProductService,
    private _fiSvc: FiService,
    private _dialogSvc: DialogService,
    private _sessionSvc: SessionService,
    private _toastr: ToastrService,
    private _log: LoggingService
  ) { }

  ngOnInit() {
    this.cols = [
      { field: "FIID", header: "FIID" },
      { field: "FIName", header: "FIName" },
      { field: "Username", header: "User Name" },
      { field: "FirstName", header: "First Name" },
      { field: "LastName", header: "Last Name" },
      { field: "Email", header: "Email" },
      { field: "Phone", header: "Phone" },
      { field: "Phone2", header: "After Hours Phone" },
      { field: "IsLocked", header: "Account Locked" },
      { field: "PasswordStatus", header: "Password Status" },
      { field: "IsMFALocked", header: "Secondary Authentication Locked" },
    ];
    this._getGridData();
    this._getProdFIIDs();
    this.SearchForm = this._fb.group({});
    this.GetTotalProductscount();
    this.dropdownSettings = {
      singleSelection: false,
      idField: "PrdID",
      textField: "Name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
    };
    this.FidropdownSettings = {
      singleSelection: true,
      idField: "FIID",
      textField: "Name",
      allowSearchFilter: true,
    };
    this._buildUserForm();
  }

  ngAfterViewInit() {
    this.adminUserModalSubscription = this.adminUserModalQuery.changes.subscribe(
      (adminQuery: QueryList<LocalModalComponent>) => {
        this.adminUserModal = adminQuery.first;
        this.adminUserModalSubscription.unsubscribe();
      }
    );
  }
  ngOnDestroy() {
    this.adminUserModalSubscription.unsubscribe();
  }
  public RefreshFilterboxGrid(dataTable: any) {
    this.onSearch("", dataTable);
  }
  public onSearch(searchText: string, datatable: any): void {
    // if(this.filterTimeout) {
    //   clearTimeout(this.filterTimeout);
    // }
    // this.filterTimeout = setTimeout(()=>{
    //     if (datatable) {
    //     datatable.filterGlobal(searchText, 'contains')
    //   }
    // },250);
    this.globalsavesearchtext = searchText;
    if (datatable) {
      datatable.filterGlobal(searchText, "contains");
    }
    searchText = searchText.toUpperCase();
  }
  // test
  public restrictToAplhaNumeric(env: any) {
    let val = env.target.value;

    // let asciiCode = val.replace(/[^A-Za-z0-9]/g, "");
    // //A-Z 65 -90 ;a-z 97-122 ;0-9 48 -57
    // if (
    //   (asciiCode < 65 || asciiCode > 90) &&
    //   (asciiCode < 97 || asciiCode > 122) &&
    //   (asciiCode < 48 || asciiCode > 57)
    // ) {
    //   env.target.value = "";
    // }

    env.target.value = env.target.value.replace(/[^A-Za-z0-9]/g, "");
    this.adminUserForm.get("Username").setValue(env.target.value);
    this.NoSpace = 1;
  }
  public restrictToValidemail(env: any) {
    var valid = this.validateEmail(env.target.value);
    if (!valid) {
      this.invalidEmail = true;
    } else {
      this.invalidEmail = false;
    }
  }
  public validateEmail(elementValue) {
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
    return emailPattern.test(elementValue);
  }

  restrictToNumeric(env: any) {
    env.target.value = env.target.value.replace(/[^0-9]+$/g, "");
    const isNotANumber = Number.isNaN(Number(env.key));
    const phoneLen = this.adminUserForm.get("Phone").value.replace(/\D/g, "")
      .length;
    const phoneAltLen = this.adminUserForm
      .get("Extension")
      .value.replace(/\D/g, "").length;
    const phoneSecondaryLen = this.adminUserForm
      .get("Phone2")
      .value.replace(/\D/g, "").length;

    if ((this.invalidPhoneLength = phoneLen > 0 && phoneLen < 10)) {
      this.invalidPhoneLength = true;
    } else {
      this.invalidPhoneLength = false;
    }

    if (
      (this.invalidSecondaryPhoneLength =
        phoneSecondaryLen > 0 && phoneSecondaryLen < 10)
    ) {
      this.invalidSecondaryPhoneLength = true;
    } else {
      this.invalidSecondaryPhoneLength = false;
    }

    if ((this.invalidPhoneAltLength = phoneAltLen > 0 && phoneAltLen < 3)) {
      this.invalidPhoneAltLength = true;
    } else {
      this.invalidPhoneAltLength = false;
    }

    if (
      isNotANumber &&
      env.key !== "Backspace" &&
      env.keyCode !== 9 &&
      env.keyCode !== 37 &&
      env.keyCode !== 39 &&
      env.keyCode !== 17 &&
      env.keyCode !== 65
    ) {
      this._toastr.error(CONSTANTS.adminusermaintMsgs.invalidDataFormat);
    }
  }
  public isUserExists(showAlert: boolean) {
    this.usernameinput = this.adminUserForm.controls["Username"].value;
    if (this.usernameinput != "") {
      this._accountSvc.isUserExists(this.usernameinput).subscribe(
        (response) => {
          if (response.Data == true) {
            this.duplicateuser = true;
            if (showAlert) {
              this.usernameAvailability =
                CONSTANTS.adminusermaintMsgs.questions.userDuplicateConfirm;
              this.adminUserForm.controls["Username"].setValue("");
            }
          } else {
            this.duplicateuser = false;
            if (showAlert) {
              this.usernameAvailability =
                CONSTANTS.adminusermaintMsgs.questions.userNotExistsConfirm;
            }
          }

          if (showAlert) {
            setTimeout(() => {
              this.usernameAvailability = "";
            }, 5000);
          }
        },
        (err: any) => { }
      );
    } else {
      this.duplicateuser = false;
      this.usernameAvailability =
        CONSTANTS.adminusermaintMsgs.error.invalidValue;
    }
  }

  public isUserEmailExists(showAlert: boolean) {
    this.useremailinput = this.adminUserForm.controls["Email"].value;
    if (!this.invalidEmail) {
      if (this.useremailinput != "") {
        this._accountSvc.IsEmailExists(this.useremailinput).subscribe(
          (resp) => {
            if (resp) {
              if (resp.isUserExists) {
                if (this.UserEditing == null) {
                  this.Confirmduplicateemail = "Exist";
                  this.duplicateemail = resp.isUserExists;
                  if (showAlert) {
                    this.emailAvailability =
                      CONSTANTS.adminusermaintMsgs.questions.emailDuplicateConfirm;
                  }
                } else {
                  if (this.UserEditing.Email != this.useremailinput) {
                    this.Confirmduplicateemail = "Exist";
                    this.duplicateemail = resp.isUserExists;
                    if (showAlert) {
                      this.emailAvailability =
                        CONSTANTS.adminusermaintMsgs.questions.emailDuplicateConfirm;
                    }
                  }
                }
              }
              if (resp.isUserExists == false) {
                this.Confirmduplicateemail = "NotExist";
                this.duplicateemail = resp.isUserExists;
                if (showAlert) {
                  this.emailAvailability =
                    CONSTANTS.adminusermaintMsgs.questions.emailNotExistsConfirm;
                }
              }
            } else {
              this.duplicateemail = false;
              this.Confirmduplicateemail = "";
              if (showAlert) {
                this.emailAvailability =
                  CONSTANTS.adminusermaintMsgs.questions.emailNotExistsConfirm;
              }
            }

            if (showAlert) {
              setTimeout(() => {
                this.emailAvailability = "";
              }, 10000);
            }
          },
          (err: any) => { }
        );
      } else {
        this.Confirmduplicateemail = "";
        this.duplicateemail = false;
        this.emailAvailability =
          CONSTANTS.adminusermaintMsgs.error.invalidValue;
      }
    }
  }

  public ResetUserPasswordGlobalAdmin() {
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    this.ResetuserId = this.UserEditing.UsrID;
    this.userEmail = this.adminUserForm.controls["Email"].value;
    if (this.UserEditing.Username == this._userDetails.username) {
      this.saving = false;
      this._toastr.error(CONSTANTS.adminusermaintMsgs.error.invalidOperation);
    } else {
      if (this.userEmail == "") {
        this._accountSvc
          .resetUserPasswordGlobal(this.UserEditing.Username)
          .subscribe((response) => {
            if (response) {
              this.userEmail = response.Email;
              (Swal as any)
                .fire({
                  title:
                    CONSTANTS.adminusermaintMsgs.questions
                      .userresetPaswordEmailConfirm,
                  type: "warning",
                  allowOutsideClick: false,
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes",
                  cancelButtonText: "No",
                })
                .then((result) => {
                  if (result.value) {
                    this.showLoading = true;
                    this._accountSvc
                      .ResetUserPasswordCPSAdmin(
                        this.UserEditing.UsrID,
                        this.UserEditing.Username,
                        this._userDetails.username,
                        this.UserEditing.Email
                      )
                      // .resetUserPassword(this._userDetails.username)
                      .subscribe((resp) => {
                        this.showLoading = false;
                        if (resp) {
                          this._toastr.success(
                            CONSTANTS.adminusermaintMsgs.questions
                              .userresetPaswordEmailSent
                          );
                        } else {
                          this._toastr.error(
                            CONSTANTS.adminusermaintMsgs.error.checkuserlock
                          );
                        }
                      });
                  } else {
                  }
                });
            }
          });
      } else {
        (Swal as any)
          .fire({
            title:
              CONSTANTS.adminusermaintMsgs.questions
                .userresetPaswordEmailConfirm,
            type: "warning",
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
          })
          .then((result) => {
            if (result.value) {
              this.showLoading = true;
              this._accountSvc
                .ResetUserPasswordCPSAdmin(
                  this.UserEditing.UsrID,
                  this.UserEditing.Username,
                  this._userDetails.username,
                  this.UserEditing.Email
                )
                .subscribe((resp) => {
                  this.showLoading = false;
                  if (resp) {
                    this._toastr.success(
                      CONSTANTS.adminusermaintMsgs.questions
                        .userresetPaswordEmailSent
                    );
                  } else {
                    this._toastr.error(
                      CONSTANTS.adminusermaintMsgs.error.checkuserlock
                    );
                  }
                });
            } else {
            }
          });
      }
    }
  }

  public resetUserSecurityQuestiondGlobalAdmin() {
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    this.ResetuserId = this.UserEditing.UsrID;
    this.userEmail = this.adminUserForm.controls["Email"].value;
    if (this.UserEditing.Username == this._userDetails.username) {
      this.saving = false;
      this._toastr.error(CONSTANTS.adminusermaintMsgs.error.invalidOperation);
    } else {
      if (this.userEmail == "") {
        this._accountSvc
          .resetUserPasswordGlobal(this.UserEditing.Username)
          .subscribe((response) => {
            if (response) {
              this.userEmail = response.Email;
              (Swal as any)
                .fire({
                  title:
                    CONSTANTS.adminusermaintMsgs.questions
                      .userresetSecurityEmailConfirm,
                  type: "warning",
                  allowOutsideClick: false,
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes",
                  cancelButtonText: "No",
                })
                .then((result) => {
                  if (result.value) {
                    this.showLoading = true;
                    this._accountSvc
                      .resetUserSecurityQuestion(
                        this.UserEditing.UsrID,
                        this._userDetails.username,
                        this.userEmail
                      )
                      .subscribe((resp) => {
                        this.showLoading = false;
                        if (resp) {
                          this._toastr.success(
                            CONSTANTS.adminusermaintMsgs.questions
                              .userresetSecurityEmailSent
                          );
                        } else {
                          this._toastr.error(
                            CONSTANTS.adminusermaintMsgs.error.generalerror
                          );
                        }
                      });
                  } else {
                  }
                });
            }
          });
      } else {
        (Swal as any)
          .fire({
            title:
              CONSTANTS.adminusermaintMsgs.questions
                .userresetSecurityEmailConfirm,
            type: "warning",
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
          })
          .then((result) => {
            if (result.value) {
              this.showLoading = true;
              this._accountSvc
                .resetUserSecurityQuestion(
                  this.UserEditing.UsrID,
                  this._userDetails.username,
                  this.userEmail
                )
                .subscribe((resp) => {
                  this.showLoading = false;
                  if (resp) {
                    this._toastr.success(
                      CONSTANTS.adminusermaintMsgs.questions
                        .userresetSecurityEmailSent
                    );
                  } else {
                    this._toastr.error(
                      CONSTANTS.adminusermaintMsgs.error.generalerror
                    );
                  }
                });
            } else {
            }
          });
      }
    }
  }
  public onUsercreateClick = () => {
    this.FIdropdownList = this.fiList;
    this.FiSelect = [];
    if (this.adminUserModal.isOpen) return;

    this.emailAvailability = "";
    this.ProductAssignedselected = [];
    this.paSelected = [];
    this.intialvalue = 1;
    this.NoSpace = 0;
    this.selectedFIID = 0;
    this.productId = 0;
    this.prodList = [];
    this._buildUserForm();
    this._getProdListSelectedFIIDs();
    this.adminUserModal.open();
  };

  public onUserCancelClick = (data: any, node: any) => {
    this.invalidPhoneLength = false;
    this.invalidSecondaryPhoneLength = false;
    this.invalidPhoneAltLength = false;
    this.adminUserModal.close();
    this.UserEditing = null;
    this.adminUserForm = null;
    this.UserEditingReadOnly = null;
    this._getGridData();
  };

  onsecondaryAuthToggle(event) {
    let secdcurrentvalue: boolean = false;
    if (this.UserEditing) {
      if (event === true) {
        this.SecondaryAuthUser = true;
      }
      if (event === false) {
        this.SecondaryAuthUser = false;
      }
      if (event.checked) {
        this.SecondaryAuthUser = event.checked;
        secdcurrentvalue = event.checked;
      }
    }

    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (this.UserEditing.Username == this._userDetails.username) {
      this.saving = false;
      this._toastr.error(CONSTANTS.adminusermaintMsgs.error.invalidOperation);
    } else {
      const msg =
        this.SecondaryAuthUser === true
          ? CONSTANTS.adminusermaintMsgs.questions.lockSecdAuthConfirm
          : CONSTANTS.adminusermaintMsgs.questions.unlockSecdAuthConfirm;

      (Swal as any)
        .fire({
          title: msg,
          type: "warning",
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
          cancelButtonText: "No",
        })
        .then((result) => {
          if (result.value) {
            this._accountSvc
              .changeSecondaryAuthLockStatus(
                this.currentUserId,
                this.SecondaryAuthUser,
                this.adminUserForm.controls["Email"].value
              )
              .subscribe((resp) => {
                if (resp) {
                  this.displayShowSecondaryauthChangedMessage(
                    resp,
                    secdcurrentvalue
                  );
                } else {
                  this.SecondaryAuthUser =
                    this.SecondaryAuthUser === true ? false : true; //golive
                }
              });
          } else {
            this.SecondaryAuthUser =
              this.SecondaryAuthUser === true ? false : true; //golive
          }
        });
    }
  }

  onUserLockToggle(env) {
    let currentvalue: boolean = false;
    if (this.UserEditing) {
      this.currentUserId = this.UserEditing.UsrID;
      if (env === true) {
        this.userlockState = true;
      }
      if (env === false) {
        this.userlockState = false;
      }
      if (env.checked) {
        this.userlockState = env.checked;
        currentvalue = env.checked;
      }
    }
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (this.UserEditing.Username == this._userDetails.username) {
      this.saving = false;
      this._toastr.error(CONSTANTS.adminusermaintMsgs.error.invalidOperation);
    } // this.liveStatus = (this.goLiveState) ? 'Live' : 'Go Live';
    else {
      const msg =
        this.userlockState === true
          ? CONSTANTS.adminusermaintMsgs.questions.lockUserConfirm
          : CONSTANTS.adminusermaintMsgs.questions.unlockUserConfirm;
      (Swal as any)
        .fire({
          title: msg,
          type: "warning",
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
          cancelButtonText: "No",
        })
        .then((result) => {
          if (result.value) {
            this._accountSvc
              .changeUserLockStatus(this.currentUserId, this.userlockState)
              .subscribe((resp) => {
                if (resp) {
                  this.displayShowLockChangedMessage(resp, currentvalue);
                } else {
                  this.userlockState =
                    this.userlockState === true ? false : true; //golive
                }
              });
          } else {
            this.userlockState = this.userlockState === true ? false : true; //golive
          }
        });
    }
  }

  displayShowLockChangedMessage(data, currentvalue) {
    this.userlockState = currentvalue;
    if (
      data === "undefined" ||
      data === null ||
      (data != null && data.message === null)
    ) {
      this._toastr.success(CONSTANTS.adminusermaintMsgs.success.lockstatus);
    }
  }
  displayShowSecondaryauthChangedMessage(data, secdcurrentvalue) {
    this.SecondaryAuthUser = secdcurrentvalue;
    if (
      data === "undefined" ||
      data === null ||
      (data != null && data.message === null)
    ) {
      this._toastr.success(CONSTANTS.adminusermaintMsgs.success.lockstatus);
    }
  }

  public updateProductOrder = (Username, products) => {
    // PRODUCT order update
    if (Username !== "") {
      this._accountSvc
        .getUserDetailsByUserName(Username)
        .subscribe((response) => {
          const userDetails = response.Data;
          const updateProduct: any = {
            usrID: userDetails.UsrID,
          };
          const prod = [];
          products.forEach((i, index) => {
            const displayOrder = index + 1;
            prod.push({ productId: i, displayOrder: displayOrder });
          });
          //console.log(prod);
          updateProduct.products = prod;
          this._prodSvc
            .updateDisplayOrderForUserProduct(updateProduct)
            .subscribe(
              (response) => { },
              (err) => { }
            );
        });
    }
  };
  public onUserSaveClick = () => {
    if (
      this.adminUserForm.invalid ||
      this.invalidPhoneLength ||
      this.invalidSecondaryPhoneLength ||
      this.invalidPhoneAltLength ||
      this.invalidEmail
    ) {
      this._toastr.error(CONSTANTS.genericCRUDMsgs.invalidInputs);
    } else {
      let data = this.adminUserForm.getRawValue();
      data.Phone =
        this.adminUserForm.get("Phone").value != null
          ? this.adminUserForm.get("Phone").value.replace(/\D/g, "")
          : "";
      data.Phone2 =
        this.adminUserForm.get("Phone2").value != null
          ? this.adminUserForm.get("Phone2").value.replace(/\D/g, "")
          : "";
      data.MainframeFIID = this.adminUserForm.get("MainframeFIID").value;
      this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);

      //if (this.UserEditing.Username) data = _.merge(this.UserEditing, data);
      if (this.UserEditing.Username)
        data = _.merge(this.UserEditing, this.UserEditingReadOnly);

      data.Username = this.adminUserForm.get("Username").value;
      data.CreateBy = this._userDetails.username;
      data.UpdateBy = this._userDetails.username;
      data.ProductsAssigned = this.UsrSelectedProds;
      data.FIID = this.adminUserForm.get("FIID").value; /* NL: TASK #189 :User FI Assignment not working */

      if (this.UsrSelectedProds.length <= 0) {
        this.saving = false;
        this._toastr.error(
          CONSTANTS.adminusermaintMsgs.error.failSaveChangesSelectProduct
        );
        return false;
      }

      if (data.FIID === "" || data.FIID == null || data.FIID === " ") {
        data.FIID = "0";
      }

      if (this.UsrSelectedProds.length === 1) {
        data.Role = "Admin";
        data.IsSysAdmin = 0;
      }
      if (this.UsrSelectedProds.length > 1 && data.FIID === "0") {
        data.Role = "Admin";
        if (this.totalproductcount == this.UsrSelectedProds.length) {
          data.IsSysAdmin = 1;
        }
        if (this.totalproductcount > this.UsrSelectedProds.length) {
          data.IsSysAdmin = 0;
        }
      }
      if (this.UsrSelectedProds.length > 1 && data.FIID > 0) {
        data.Role = "Admin";
        data.IsSysAdmin = 0;
      }

      this.saving = true;

      if (this.UserEditing.Username) {
        if (this.UserEditing.Username === this._userDetails.username) {
          this.saving = false;
          this._toastr.error(
            CONSTANTS.adminusermaintMsgs.error.invalidOperation
          );
        } else {
          if (!this.duplicateemail) {
            this.saving = true;
            data.IsJHAUser = !data.FIID || data.FIID == "0" ? true : false;
            data.IsLocked = this.userlockState;
            data.IsMFALocked = this.SecondaryAuthUser;
            data.IsMFAEnabled = true;
            data.isProductSynced = true;
            if (
              data.FirstName === this.lepChange.FirstName &&
              data.LastName === this.lepChange.LastName &&
              data.Email === this.lepChange.Email &&
              data.Phone === this.lepChange.Phone
            ) {
              this._accountSvc.updateProductUserAccount(data).subscribe(
                (response) => {
                  if (response) {
                    this._getGridData();
                    this.adminUserModal.close();
                    this.UserEditing = null;
                    this.adminUserForm = null;
                    this.Confirmduplicateemail = "";
                    this.UserEditingReadOnly = null; // email checking..
                    this.saving = false;
                    this._toastr.success(
                      CONSTANTS.adminusermaintMsgs.success.userUpdate
                    );
                    this.updateProductOrder(
                      data.Username,
                      data.ProductsAssigned
                    );
                  } else {
                    this.saving = false;
                    this._toastr.error(
                      CONSTANTS.adminusermaintMsgs.error.generalerror
                    );
                  }
                },
                (err) => {
                  this.saving = false;
                  this._toastr.error(
                    CONSTANTS.adminusermaintMsgs.error.failSaveChanges
                  );
                }
              );
            } else {
              (Swal as any)
                .fire({
                  title:
                    CONSTANTS.adminusermaintMsgs.questions.changeEditUserInfo,
                  type: "warning",
                  allowOutsideClick: false,
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes",
                  cancelButtonText: "No",
                })
                .then((result) => {
                  if (result.value) {
                    this._accountSvc.updateProductUserAccount(data).subscribe(
                      (response) => {
                        if (response) {
                          this._getGridData();
                          this.adminUserModal.close();
                          this.UserEditing = null;
                          this.adminUserForm = null;
                          this.Confirmduplicateemail = "";
                          this.UserEditingReadOnly = null; // email check
                          this.saving = false;
                          this._toastr.success(
                            CONSTANTS.adminusermaintMsgs.success.userUpdate
                          );
                          this.updateProductOrder(
                            data.Username,
                            data.ProductsAssigned
                          );
                        } else {
                          this.saving = false;
                          this._toastr.error(
                            CONSTANTS.adminusermaintMsgs.error.generalerror
                          );
                        }
                      },
                      (err) => {
                        this.saving = false;
                        this._toastr.error(
                          CONSTANTS.adminusermaintMsgs.error.failSaveChanges
                        );
                      }
                    );
                  } else {
                    this.saving = false;
                  }
                });
            }
          } else {
            this.saving = false;
            this._toastr.error(
              CONSTANTS.adminusermaintMsgs.error.failEmailExists
            );
          }
        }
      } else {
        this.isUserExists(false);
        this.isUserEmailExists(false);
        data.UsrID = 0;
        data.CreateBy = this._userDetails.username;
        data.IsLocked = false;
        data.IsMFAEnabled = true;
        data.IsMFALocked = false;
        data.IsJHAUser = !data.FIID || data.FIID === "0" ? true : false;
        data.UpdateBy = this._userDetails.username;

        if (!this.duplicateuser) {
          if (!this.duplicateemail) {
            this.saving = true;
            this._accountSvc.createProductUserAccount(data).subscribe(
              (response) => {
                this._getGridData();
                this.adminUserModal.close();
                this.UserEditing = null;
                this.duplicateemail = false;
                this.adminUserForm = null;
                this.saving = false;
                this.UserEditingReadOnly = null; // email check
                this._toastr.success(
                  CONSTANTS.adminusermaintMsgs.success.userSave
                );

                // PRODUCT order update
                this.updateProductOrder(data.Username, data.ProductsAssigned);
              },
              (err) => {
                this.saving = false;
                this._toastr.error(
                  CONSTANTS.adminusermaintMsgs.error.failSaveChanges
                );
              }
            );
          } else {
            this.saving = false;
            this._toastr.error(
              CONSTANTS.adminusermaintMsgs.error.failEmailExists
            );
            this.adminUserForm.controls["Email"].setValue("");
            //this.duplicateemail = true;
          }
        } else {
          this.saving = false;
          this._toastr.error(CONSTANTS.adminusermaintMsgs.error.failUserExists);
          this.adminUserForm.controls["Username"].setValue("");
        }
      }
    }
  };

  public GetTotalProductscount() {
    this._prodSvc.RetrieveProduct(0, 0).subscribe((response) => {
      this.totalproductcount = response.Data.length - 1;
    });
  }

  public _getProdListSelectedFIIDs(assignedProductId = null) {
    this.dropdownList = [];
    this.prodList = [];

    if (this.selectedFIID <= 0) {
      this.productId = 0;
    }

    this._prodSvc.RetrieveProduct(0, this.selectedFIID).subscribe(
      (response) => {
        if (response && response.Data.length > 0) {
          response.Data.forEach((prod: any) => {
            if (prod.PrdID !== PRODUCT_IDS.INTRO) {
              this.prodList.push(prod);
            } else {
              //dont push to prodlist
            }
          });
          this.dropdownList = this.prodList;
          if (assignedProductId != null) {
            assignedProductId.forEach((users) => {
              const prdId = users.ProductsAssigned[0];
              this.dropdownList.forEach((element) => {
                if (element.PrdID === prdId) {
                  this.paSelected.push(element);
                }
              });
            });
          }
          this.ProductAssignedselected = this.paSelected;
          this.userSelectedProductList = this.ProductAssignedselected;
          this.ProductAssginedSelectedAll(this.paSelected);
          return true;
        }
      },
      (err: any) => {
        this._toastr.error(CONSTANTS.adminusermaintMsgs.error.failLoadProducts);
        return false;
      }
    );
  }

  public _getProdFIIDs() {
    this.loadingFIDs = true;
    this._accountSvc.RetrieveFIInformationByProductId(null).subscribe(
      (response) => {
        if (response && response.length > 0) {
          response.forEach((f: FiContext) => {
            this.fiList.push(f);
          });
        }
      },
      (err: any) => {
        this.loadingFIDs = false;
      }
    );

    //this._filterFiLists();
    this.loadingFIDs = false;
  }

  FIChange(FIlist) {
    console.log(FIlist.FIID);

    this.selectedFIID = FIlist.FIID;
    this.adminUserForm.controls["FIID"].setValue(this.selectedFIID);
    this.adminUserForm.controls["FIName"].setValue(FIlist.Name);
    this._getProdListSelectedFIIDs();
    if ((this.selectedFIID = 0)) {
      this.adminUserForm.controls["FIID"].setValue(0);
      this.adminUserForm.controls["FIName"].setValue("");
      this.adminUserForm.controls["Role"].setValue("");
      this._getProdListSelectedFIIDs();
    }
  }
  FIDeChange() {
    this.selectedFIID = 0;
    this.adminUserForm.controls["FIID"].setValue(0);
    this.adminUserForm.controls["Role"].setValue("");
    this._getProdListSelectedFIIDs();
  }

  ProductAssginedSelectedAll(SelectedProductAssigned) {
    let pdata = [];
    pdata = this.prodList;
    let i;
    this.UsrSelectedProds = [];
    // let introflag = false;

    for (i = 0; i < SelectedProductAssigned.length; i += 1) {
      pdata.forEach((element) => {
        // if(SelectedProductAssigned[i].Name == "Introduction"){
        //   introflag = true;
        // }
        if (element.PrdID === SelectedProductAssigned[i].PrdID) {
          this.UsrSelectedProds.push(SelectedProductAssigned[i].PrdID);
        }
      });
    }

    if (
      this.totalproductcount === this.UsrSelectedProds.length &&
      this.selectedFIID > 0
    ) {
      this.adminUserForm.controls["Role"].setValue("Product Admin");
    }
    if (
      this.totalproductcount === this.UsrSelectedProds.length &&
      this.selectedFIID === 0
    ) {
      this.adminUserForm.controls["Role"].setValue("CPS Admin");
    }
    if (this.totalproductcount > this.UsrSelectedProds.length) {
      this.adminUserForm.controls["Role"].setValue("Product Admin");
    }
  }
  ProductAssginedSelectedDeAll(SelectedProductAssigned) {
    this.UsrSelectedProds = [];
    this.adminUserForm.controls["Role"].setValue("");
  }
  ProductAssginedSelectedOne(SelectedProductAssigned) {
    let pdata = [];
    pdata = this.prodList;
    let i;
    pdata.forEach((element) => {
      if (element.PrdID === SelectedProductAssigned.PrdID) {
        this.UsrSelectedProds.push(SelectedProductAssigned.PrdID);
      }
    });

    if (
      this.totalproductcount === this.UsrSelectedProds.length &&
      this.selectedFIID > 0
    ) {
      this.adminUserForm.controls["Role"].setValue("Product Admin");
    }
    if (
      this.totalproductcount === this.UsrSelectedProds.length &&
      this.selectedFIID === 0
    ) {
      this.adminUserForm.controls["Role"].setValue("CPS Admin");
    }
    if (this.totalproductcount > this.UsrSelectedProds.length) {
      this.adminUserForm.controls["Role"].setValue("Product Admin");
    }
  }
  ProductAssginedSelectedDeOne(SelectedProductAssigned) {
    let pdata = [];
    pdata = this.UsrSelectedProds;
    let i;
    for (i = 0; i < pdata.length; i += 1) {
      if (pdata[i] === SelectedProductAssigned.PrdID) {
        pdata.splice(i, 1);
      }
    }
    this.UsrSelectedProds = pdata;

    if (
      this.totalproductcount === this.UsrSelectedProds.length &&
      this.selectedFIID > 0
    ) {
      this.adminUserForm.controls["Role"].setValue("Product Admin");
    }
    if (
      this.totalproductcount === this.UsrSelectedProds.length &&
      this.selectedFIID === 0
    ) {
      this.adminUserForm.controls["Role"].setValue("CPS Admin");
    }
    if (this.totalproductcount > this.UsrSelectedProds.length) {
      this.adminUserForm.controls["Role"].setValue("Product Admin");
    }
  }
  private _filterFiLists() {
    if (
      this.fiList &&
      this.fiList.length &&
      this.productFiIDs &&
      this.productFiIDs.length
    ) {
      // this._log.debug(`${this.CLASSNAME} > _filterFiLists()`);

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

    //  this._setFiGridData();
  }
  private _getGridData() {
    this.loading = true;
    const checkDuplicate = [];
    this.usersData = [];
    this._accountSvc.getUserAccountDetails().subscribe(
      (response) => {
        if (response && response.length > 0) {
          response.forEach((user: UserDetailContext) => {
            if (user.PrdID !== PRODUCT_IDS.INTRO) {
              if (user.FIID === null) {
                user.FIID = "";
              }
              const index: number = checkDuplicate.findIndex((v) => {
                return v.userid === user.UsrID;
              });
              if (index < 0) {
                checkDuplicate.push({ userid: user.UsrID });
                this.users.push(user);
                this.usersData.push(user);
                const usersIndex = this.usersData.findIndex((v) => {
                  return v.UsrID === user.UsrID;
                });
                if (usersIndex >= 0) {
                  this.usersData[usersIndex].SameIdUsers = [user];
                  if (this.usersData[usersIndex].SameIdUsers) {
                    this.usersData[usersIndex].SameIdUsers = _.sortBy(
                      this.usersData[usersIndex].SameIdUsers,
                      "PrdID"
                    );
                  }
                }
              } else {
                const usersIndex = this.usersData.findIndex((v) => {
                  return v.UsrID === user.UsrID;
                });
                if (usersIndex >= 0) {
                  this.usersData[usersIndex].SameIdUsers.push(user);
                  if (this.usersData[usersIndex].SameIdUsers) {
                    this.usersData[usersIndex].SameIdUsers = _.sortBy(
                      this.usersData[usersIndex].SameIdUsers,
                      "PrdID"
                    );
                  }
                }
              }
            }
          });
        }
        // this._setGridData();
        this.userMaintList = this.usersData;
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
      }
    );
  }

  collaspeAll() {
    this.expandedRows = [];
  }

  public onUserEditClick = (data: any, node: any) => {
    this.FIdropdownList = this.fiList;
    this.FiSelect = [];
    const ndata = data.data; //node.data
    this.invalidEmail = false;
    this.ProductAssignedselected = [];
    this.paSelected = [];
    this.intialvalue = 0;
    this.NoSpace = 0;
    this.selectedFIID = ndata.FIID && ndata.FIID != null ? ndata.FIID : 0;
    this.productId = ndata.PrdID;
    this._getProdListSelectedFIIDs(ndata.SameIdUsers);
    if (ndata.Phone !== "") {
      ndata.Phone = ndata.Phone.replace(/\D/g, "").replace(
        /^(\d{0,3})(\d{0,3})(.*)/,
        "($1) $2-$3"
      );
    }
    if (ndata.Phone2 !== "") {
      ndata.Phone2 = ndata.Phone2.replace(/\D/g, "").replace(
        /^(\d{0,3})(\d{0,3})(.*)/,
        "($1) $2-$3"
      );
    }

    const eu = ndata;
    delete eu.SameIdUsers;
    this._buildUserForm(eu);
    this.adminUserForm.controls["Username"].disable();
    this.userlockState = ndata.IsLocked;
    this.SecondaryAuthUser = ndata.IsMFALocked;
    this.HighlightedProducts = ndata.ProductName;
    this.selectedProdsinlist = [ndata.ProductName];
    const ed = Object.assign({}, eu);
    this.lepChange = ed;
    this.adminUserModal.open();
  };

  public onUserDeleteClick = (data: any, action) => {
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    const ndata = data.data; //node.data;
    let msg = CONSTANTS.adminusermaintMsgs.questions.deleteUserConFirm;
    if (action === "All") {
      msg = CONSTANTS.adminusermaintMsgs.questions.deleteUserConFirm;
    }
    if (ndata.Username === this._userDetails.username) {
      this.saving = false;
      this._toastr.error(CONSTANTS.adminusermaintMsgs.error.invalidOperation);
      return;
    }
    (Swal as any)
      .fire({
        title: msg,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      })
      .then((result) => {
        if (result.value) {
          if (action === "All") {
            ndata.SameIdUsers.forEach((users) => {
              this._accountSvc
                .deleteUserAccount(users.UsrID, null)
                .subscribe((response) => {
                  this._getGridData();
                });
            });
            (Swal as any).fire(
              "Deleted!",
              "User deleted and products have been de-assigned successfully!",
              "success"
            );
          } else {
            this._accountSvc
              .deleteUserAccount(ndata.UsrID, ndata.PrdID)
              .subscribe((response) => {
                const index = this.users.findIndex((u: UserDetailContext) => {
                  return ndata.UsrID === u.UsrID;
                });

                if (index >= 0) {
                  this.users.splice(index, 1);
                }
                this._getGridData();
                (Swal as any).fire(
                  "Deleted!",
                  "Product has been de-assigned successfully!",
                  "success"
                );
              });
          }
        }
      });
  };

  public collapseAll() {
    this.expandedRows = [];
  }
  private _buildUserForm(
    userlist: UserDetailContext = new UserDetailContext()
  ) {
    this.UserEditing = userlist;
    this.UserEditingReadOnly = { ...this.UserEditing }; // email check
    if (this.UserEditing.UsrID) {
      const Fi =
        this.UserEditing.FIID && this.UserEditing.FIID != null
          ? this.UserEditing.FIID
          : " ";
      if (this.UserEditing.FIID != "" && this.UserEditing.FIID !== "0") {
        const fid: number = Number(this.UserEditing.FIID);
        const filists: any = this.fiList;
        filists.forEach((element) => {
          if (element.FIID === fid) {
            this.FiSelect.push(element);
          }
        });
      }
      this.adminUserForm = this._fb.group({
        Username: new FormControl(
          this.UserEditing.Username,
          Validators.required
        ),
        FIID: new FormControl(Fi),
        FirstName: new FormControl(
          this.UserEditing.FirstName,
          Validators.required
        ),
        FIName: new FormControl(this.UserEditing.FIName),
        LastName: new FormControl(
          this.UserEditing.LastName,
          Validators.required
        ),
        MainframeFIID: new FormControl(this.UserEditing.MainframeFIID),
        Email: new FormControl(this.UserEditing.Email, Validators.required),
        Phone: new FormControl(this.UserEditing.Phone),
        Phone2: new FormControl(this.UserEditing.Phone2),
        // AfterHoursPhone: new FormControl(this.UserEditing.Phone2),
        ProductAssigned: new FormControl(this.UserEditing.ProductName),
        Role: new FormControl(this.UserEditing.Role, Validators.required),
        PasswordStatus: new FormControl(this.UserEditing.PasswordStatus),
        Extension: new FormControl(this.UserEditing.Extension),
      });
    } else {
      this.adminUserForm = this._fb.group({
        Username: new FormControl("", Validators.required),
        FIID: new FormControl(""),
        FirstName: new FormControl("", Validators.required),
        FIName: new FormControl(""),
        LastName: new FormControl("", Validators.required),
        MainframeFIID: new FormControl(""),
        Email: new FormControl("", Validators.required),
        Phone: new FormControl(""),
        Phone2: new FormControl(""),
        //  AfterHoursPhone: new FormControl(''),
        ProductAssigned: new FormControl(""),
        Role: new FormControl("", Validators.required),
        Extension: new FormControl(""),
        PasswordStatus: new FormControl("Active"),
      });
    }
  }
  public numberFormatter(params) {
    if (params.value != null) {
      let newVal = params.value.replace(/\D/g, "");
      if (newVal.length === 0) {
        return "";
      } else {
        return params.value
          .replace(/\D/g, "")
          .replace(/^(\d{0,3})(\d{0,3})(.*)/, "($1) $2-$3");
      }
    }
    return "";
  }
  // private _initGridConfig() {
  //   this.gridOptions = _.merge(<IGridOptions>{}, this._agSvc.defaultOptions);

  //   this.gridOptions.idField = 'UsrID';

  //   this.gridOptions.columns = <IGridColumn[]>[
  //     {
  //       headerName: 'FIID',
  //       cellRenderer: 'agGroupCellRenderer',
  //       field: 'FIID',
  //       sort: 'asc'
  //     },
  //     {
  //       headerName: 'FIName',
  //       field: 'FIName'
  //     },
  //     {
  //       headerName: 'User Name',
  //       field: 'Username'
  //     },
  //     {
  //       headerName: 'First Name',
  //       field: 'FirstName'
  //     },
  //     {
  //       headerName: 'Last Name',
  //       field: 'LastName'
  //     },
  //     // {
  //     //   headerName: 'Mainframe FIID',
  //     //   field: 'MainframeFIID'
  //     // },
  //     {
  //       headerName: 'Email',
  //       field: 'Email'
  //     },
  //     {
  //       headerName: 'Phone',
  //       field: 'Phone',
  //       valueFormatter: this.numberFormatter,
  //     },
  //     {
  //       headerName: 'After Hours Phone',
  //       field: 'Phone2',
  //       valueFormatter: this.numberFormatter
  //     },
  //     // {
  //     //   headerName: 'Product Assigned',
  //     //   field: 'ProductName'
  //     // },
  //     // {
  //     //   headerName: 'Role',
  //     //   field: 'Role'
  //     // },
  //     {
  //       headerName: 'Account Locked',
  //       field: 'IsLocked'
  //     },
  //     {
  //       headerName: 'Password Status',
  //       field: 'PasswordStatus'
  //     },
  //     {
  //       headerName: 'Secondary Authentication Locked',
  //       field: 'IsMFALocked'
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
  //             onClick: this.onUserEditClick.bind(this, ['All'])
  //           },
  //           <IGridActionItem>{
  //             type: 'anchor',
  //             classes: 'button-image btn-delete',
  //             onClick: this.onUserDeleteClick.bind(this, ['All'])
  //           }
  //         ]
  //       },
  //       width: 75,
  //       minWidth: 75,
  //       maxWidth: 75
  //     }
  //   ];
  //   this.gridOptions.masterDetail = true;
  //   this.gridOptions.detailCellRenderer = 'agMasterDetailRenderer';
  //   this.gridOptions.detailCellRendererParams = {
  //     detailGridOptions: <IGridOptions>{
  //       columnDefs: [
  //         {
  //           headerName: 'Product Assigned',
  //           field: 'ProductName',
  //         },
  //         {
  //           headerName: 'Role',
  //           field: 'Role',
  //         },
  //         {
  //           tooltip: () => {
  //             return CONSTANTS.adminusermaintMsgs.questions.removeProductAssignment;
  //           },
  //           cellClass: ['ag-cell-actions'],
  //           cellRenderer: 'agActionsRenderer',
  //           cellRendererParams: {
  //             items: [
  //               <IGridActionItem>{
  //                 type: 'anchor',
  //                 classes: 'button-image btn-delete',
  //                 onClick: this.onUserDeleteClick.bind(this, ['Singal'])
  //               }
  //             ]
  //           },
  //           width: 60,
  //           minWidth: 60,
  //           maxWidth: 60
  //         }
  //       ],
  //       onGridReady(params) {
  //         params.api.sizeColumnsToFit();
  //       }
  //     },
  //     getDetailRowData: (params) => {
  //       return params.data.SameIdUsers;
  //     }
  //   };
  // }
}
