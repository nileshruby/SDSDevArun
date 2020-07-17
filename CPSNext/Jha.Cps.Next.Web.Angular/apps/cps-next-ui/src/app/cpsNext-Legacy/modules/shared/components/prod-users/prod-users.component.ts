import {
  Component,
  Input,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import {
  LoggingService,
  AccountService,
  ProductService,
  FiService,
  DialogService,
  SessionService,
  VaultService
} from "@app/services";
import { LocalModalComponent } from "@app/modules/shared/components";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from "@angular/forms";
import {
  UserDetailContext,
  FiContext,
  ProductContext
} from "@app/entities/models";
import { UserContext } from "@app/entities/user-context";
import { ToastrService } from "ngx-toastr";
import { DialogConfig, DialogTypes } from "@app/entities/dialog";
import { CONSTANTS } from "@app/entities/constants";
import * as _ from "lodash";
import { APP_KEYS } from "@app/entities/app-keys";
import { PRODUCT_IDS } from "@app/entities/product-ids";
import Swal from "sweetalert2";
import { InputValidationService } from "@app/services";
import { HighlightResult } from "ngx-highlightjs";
import { Subscription } from "rxjs";

@Component({
  selector: "prod-users",
  templateUrl: "./prod-users.component.html",
  styleUrls: ["./prod-users.component.scss"]
})
export class ProductUsersPageComponent implements AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = "ProductUsersPageComponent";
  public IV: InputValidationService = new InputValidationService();

  @ViewChildren("adminUserModal") adminUserModalQuery: QueryList<
    LocalModalComponent
  >;
  adminUserModalSubscription: Subscription;
  adminUserModal: LocalModalComponent;

  public loading = false;
  public saving = false;
  public adminUserForm: FormGroup;
  public ResetFilterboxForm: FormGroup;
  public users: UserDetailContext[] = [];
  usersList: any = [];
  public UserEditing: UserDetailContext = null;

  public productFiIDs: number[] = [];
  public productFiList: FiContext[] = [];
  public fiSelectList: FiContext[] = [];
  public fiList: FiContext[] = [];
  public usernameinput = "";
  public useremailinput = "";
  public ResetuserId = 0;
  public currentUserId = 0;
  twoSecondPauseInProgressTimeout: any;
  public slectedFIproducts: ProductContext[] = null;
  public intialvalue = 0;
  public prodList: ProductContext[] = [];
  _userDetails: UserContext = this._sessionSvc.get(APP_KEYS.userContext);
  public newprodList: ProductContext[] = [];
  public loadingFIDs = false;

  userlockState = false;
  lockStatus = "Unlock";
  SecondaryAuthUser = false;
  public selectedFIID = 0;
  public selectedProdsinlist: ProductContext[] = [];
  // public productId = PRODUCT_IDS.QR;
  @Input() productId;
  public Heading: string;
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
  response: HighlightResult;
  public lockuserStatus = false;
  public lockSecondaryuserStatus = false;
  invalidPhoneAltLength = false;
  invalidPhoneLength = false;
  invalidSecondaryPhoneLength = false;
  invalidEmail = false;
  dropdownSettings = {};
  dropdownList = [];
  FidropdownSettings = {};
  FiSelect: any = [];
  ProductAssignedselected = [];
  paSelected = [];
  isDisabled = false;
  isEditM = false;
  showLoading = false;
  isEditDisabled = false;
  lepChange: any = [];
  SearchForm: FormGroup;
  cols: any[] = [];

  constructor(
    private _fb: FormBuilder,
    private _accountSvc: AccountService,
    private _prodSvc: ProductService,
    private _fiSvc: FiService,
    private _dialogSvc: DialogService,
    private _sessionSvc: SessionService,
    private _toastr: ToastrService,
    private _log: LoggingService,
    private _valutService: VaultService
  ) {}

  ngOnInit() {
    this.cols = [
      { field: "FIID", header: "FIID" },
      { field: "FIName", header: "FIName" },
      { field: "Username", header: "User Name" },
      { field: "FirstName", header: "First Name" },
      { field: "LastName", header: "Last Name" },
      { field: "MainframeFIID", header: "Mainframe FIID" },
      { field: "Email", header: "Email" },
      { field: "Phone", header: "Phone" },
      { field: "Role", header: "Role" },
      { field: "IsLocked", header: "Account Locked" },
      { field: "PasswordStatus", header: "Password Status" },
      { field: "IsMFALocked", header: "Secondary Authentication Locked" }
    ];
    this._getGridData();
    this._getProdFIIDs();
    this.GetTotalProductscount();
    this._buildUserForm();
    this.FidropdownSettings = {
      singleSelection: true,
      idField: "FIID",
      textField: "Name",
      allowSearchFilter: true,
      closeDropDownOnSelection: true
    };
    let productList = this._valutService.get(APP_KEYS.userContext);
    if (productList != null) {
      productList.assginedProducts.forEach(prod => {
        if (prod.productId == this.productId) {
          this.Heading = prod.productName;
        }
      });
    }
    this.SearchForm = this._fb.group({
      searchService: new FormControl("")
    });
  }

  public RefreshFilterboxGrid(dataTable: any) {
    this.onSearch("", dataTable);
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

  filterTimeout = null;
  public onSearch(searchText: string, datatable: any): void {
    if (datatable) {
      datatable.filterGlobal(searchText, "contains");
    }
    searchText = searchText.toUpperCase();
  }
  onHighlight(e) {
    this.response = {
      language: e.language,
      r: e.r,
      second_best: "{...}",
      top: "{...}",
      value: "{...}"
    };
  }

  public IsCheckUserName(env: any) {
    if (this.twoSecondPauseInProgressTimeout) {
      clearTimeout(this.twoSecondPauseInProgressTimeout);
    }
    this.twoSecondPauseInProgressTimeout = setTimeout(() => {
      this.callCheckUserNameApi(env);
    }, 2500);
  }

  callCheckUserNameApi(env) {
    let checkfalse = false;
    let currentproduct = this.productId;
    env.target.value = env.target.value.replace(/[^A-Za-z0-9]+$/g, "");
    if (this.isEditM && env.target.value == this.UserEditing.Username) {
      return;
    }
    if (env.target.value != "" && env.target.value != null) {
      this._accountSvc
        .getUserDetailsByUserName(env.target.value)
        .subscribe(response => {
          const userDetails = response.Data;
          if (userDetails != null) {
            // console.log(userDetails);

            if (userDetails.FIID == null || userDetails.FIID == 0) {
              let exUser;
              let exUYserProd = [];
              this._accountSvc.getUserAccountDetails().subscribe(
                response => {
                  // console.log(response);
                  if (response && response.length > 0) {
                    response.forEach((user: any) => {
                      if (userDetails.UsrID == user.UsrID) {
                        exUser = user;
                        exUYserProd.push(user.ProductsAssigned[0]);
                      }
                    });
                    // console.log(exUser);
                    // console.log(exUYserProd);
                    // console.log(this.totalproductcount);
                    if (
                      exUser.IsSysAdmin == true &&
                      exUYserProd.length == this.totalproductcount
                    ) {
                      (Swal as any)
                        .fire({
                          title: CONSTANTS.adminusermaintMsgs.error.isCPSUser,
                          type: "warning",
                          allowOutsideClick: false,
                          showCancelButton: false,
                          confirmButtonColor: "#3085d6",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Ok"
                        })
                        .then(result => {
                          if (result.value) {
                            this.isDisabled = false;
                            this._buildUserForm();
                          }
                        });
                      checkfalse = false;
                    } else if (exUser.IsJHAUser && !exUser.FIID) {
                      (Swal as any)
                        .fire({
                          title:
                            CONSTANTS.adminusermaintMsgs.questions
                              .selectedUserAssign,
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
                            let userEditData: UserDetailContext = new UserDetailContext();
                            userEditData.FIName = userDetails.FIID;
                            userEditData.Email = userDetails.Email;
                            userEditData.Extension = userDetails.Extension;
                            userEditData.FIID = userDetails.FIID;
                            userEditData.FirstName = userDetails.FirstName;
                            userEditData.LastName = userDetails.LastName;
                            userEditData.Phone = userDetails.Phone;
                            userEditData.Phone2 = userDetails.Phone2;
                            userEditData.UsrID = userDetails.UsrID;
                            userEditData.Username = userDetails.Username;
                            userEditData.Role = exUser.Role;
                            this._buildUserForm(userEditData);
                            this.isDisabled = true;
                          } else {
                            this.isDisabled = false;
                            this._buildUserForm();
                          }
                        });
                      checkfalse = false;
                    }
                  }
                },
                (err: any) => {}
              );
            } else if (
              !userDetails.IsSysAdmin &&
              userDetails.IsJHAUser &&
              !userDetails.FIID
            ) {
              (Swal as any)
                .fire({
                  title:
                    CONSTANTS.adminusermaintMsgs.questions.selectedUserAssign,
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
                    let userEditData: UserDetailContext = new UserDetailContext();
                    userEditData.FIName = userDetails.FIID;
                    userEditData.Email = userDetails.Email;
                    userEditData.Extension = userDetails.Extension;
                    userEditData.FIID = userDetails.FIID;
                    userEditData.FirstName = userDetails.FirstName;
                    userEditData.LastName = userDetails.LastName;
                    userEditData.Phone = userDetails.Phone;
                    userEditData.Phone2 = userDetails.Phone2;
                    userEditData.UsrID = userDetails.UsrID;
                    userEditData.Username = userDetails.Username;
                    userEditData.Role = "Admin";
                    this._buildUserForm(userEditData);
                    this.isDisabled = true;
                  } else {
                    this.isDisabled = false;
                    this._buildUserForm();
                  }
                });
              checkfalse = false;
            } else if (!userDetails.IsSysAdmin && userDetails.FIID > 0) {
              this._prodSvc.RetrieveProduct(0, userDetails.FIID).subscribe(
                response => {
                  if (response && response.Data.length > 0) {
                    let exprod = false;
                    response.Data.forEach((prod: any) => {
                      // console.log(prod);
                      //this.productId
                      if (currentproduct == prod.PrdID) {
                        exprod = true;
                      }

                      if (exprod) {
                        (Swal as any)
                          .fire({
                            title:
                              CONSTANTS.adminusermaintMsgs.questions
                                .selectedUserAssign,
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
                              let userEditData: UserDetailContext = new UserDetailContext();
                              userEditData.FIName = userDetails.FIID;
                              userEditData.Email = userDetails.Email;
                              userEditData.Extension = userDetails.Extension;
                              userEditData.FIID = userDetails.FIID;
                              userEditData.FirstName = userDetails.FirstName;
                              userEditData.LastName = userDetails.LastName;
                              userEditData.Phone = userDetails.Phone;
                              userEditData.Phone2 = userDetails.Phone2;
                              userEditData.UsrID = userDetails.UsrID;
                              userEditData.Username = userDetails.Username;
                              userEditData.Role = "Admin";
                              this._buildUserForm(userEditData);
                              this.isDisabled = true;
                            } else {
                              this.isDisabled = false;
                              this._buildUserForm();
                            }
                          });
                        checkfalse = false;
                      } else {
                        checkfalse = true;
                        if (checkfalse) {
                          (Swal as any)
                            .fire({
                              title:
                                CONSTANTS.adminusermaintMsgs.error
                                  .fiNotAssociatedProd,
                              type: "warning",
                              allowOutsideClick: false,
                              showCancelButton: false,
                              confirmButtonColor: "#3085d6",
                              cancelButtonColor: "#d33",
                              confirmButtonText: "Ok"
                            })
                            .then(result => {
                              if (result.value) {
                                this.isDisabled = false;
                                this._buildUserForm();
                              }
                            });
                        }
                      }
                    });
                  }
                },
                (err: any) => {
                  this._toastr.error(
                    CONSTANTS.adminusermaintMsgs.error.failLoadProducts
                  );
                  return false;
                }
              );
            }
          }
        });
      if (checkfalse) {
        (Swal as any)
          .fire({
            title: CONSTANTS.adminusermaintMsgs.error.fiNotAssociatedProd,
            type: "warning",
            allowOutsideClick: false,
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ok"
          })
          .then(result => {
            if (result.value) {
              this.isDisabled = false;
              this._buildUserForm();
            }
          });
      }
    }
  }

  public restrictToValidemail(env: any) {
    var valid = this.validateEmail(env.target.value);
    if (!valid) {
      this.invalidEmail = true;
    } else {
      this.invalidEmail = false;
      this.isUserEmailExists(false);
    }
  }
  public validateEmail(elementValue) {
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
    return emailPattern.test(elementValue);
  }
  public restrictToNumeric(env: any) {
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
      this._toastr.error(CONSTANTS.adminusermaintMsgs.error.invalidValue);
    }
  }
  public IsUserExists(showAlert: boolean) {
    this.usernameinput = this.adminUserForm.controls["Username"].value;
    if (this.usernameinput != "") {
      this._accountSvc.isUserExists(this.usernameinput).subscribe(
        response => {
          if (response.Data == true) {
            this.duplicateuser = true;
            if (showAlert) {
              this.usernameAvailability =
                CONSTANTS.adminusermaintMsgs.questions.userDuplicateConfirm;
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
        (err: any) => {}
      );
    } else {
      this.duplicateuser = false;
      this.usernameAvailability =
        CONSTANTS.adminusermaintMsgs.error.invalidValue;
    }
  }

  public isUserEmailExists(showAlert: boolean) {
    this.useremailinput = this.adminUserForm.controls["Email"].value;
    // console.log(this.useremailinput );
    if (!this.invalidEmail) {
      if (this.useremailinput != "") {
        this._accountSvc.IsEmailExists(this.useremailinput).subscribe(
          resp => {
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
          (err: any) => {}
        );
      } else {
        this.Confirmduplicateemail = "";
        this.duplicateemail = false;
        this.emailAvailability =
          CONSTANTS.adminusermaintMsgs.error.invalidValue;
      }
    }
  }

  public ValidateUserEmailExists(email: any) {
    this._accountSvc.IsEmailExists(email).subscribe(
      resp => {
        if (resp) {
          if (resp.isUserExists) {
            this.Confirmduplicateemail = "Exist";
            // this._toastr.info("Email already exists");
          } else {
            this.Confirmduplicateemail = "NotExist";
          }
        }
      },
      (err: any) => {}
    );
  }
  public ResetUserPasswordGlobalAdmin() {
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    this.ResetuserId = this.UserEditing.UsrID;
    this.userEmail = this.adminUserForm.controls["Email"].value;
    if (this.UserEditing.Username === this._userDetails.username) {
      this.saving = false;
      this._toastr.error(CONSTANTS.adminusermaintMsgs.error.invalidOperation);
    } else {
      if (this.userEmail == "") {
        this._accountSvc
          .resetUserPasswordGlobal(this.UserEditing.Username)
          .subscribe(response => {
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
                  cancelButtonText: "No"
                })
                .then(result => {
                  if (result.value) {
                    this.showLoading = true;
                    this._accountSvc
                      .resetUserPassword(this.UserEditing.Username)
                      .subscribe(resp => {
                        this.showLoading = false;
                        if (resp) {
                          this._toastr.success(
                            CONSTANTS.adminusermaintMsgs.questions
                              .userresetPaswordEmailSent
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
                .userresetPaswordEmailConfirm,
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
              this.showLoading = true;
              this._accountSvc
                .resetUserPassword(this.UserEditing.Username)
                .subscribe(resp => {
                  this.showLoading = false;
                  if (resp) {
                    this._toastr.success(
                      CONSTANTS.adminusermaintMsgs.questions
                        .userresetPaswordEmailSent
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
          .subscribe(response => {
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
                  cancelButtonText: "No"
                })
                .then(result => {
                  if (result.value) {
                    this.showLoading = true;
                    this._accountSvc
                      .resetUserSecurityQuestion(
                        this.UserEditing.UsrID,
                        this._userDetails.username,
                        this.userEmail
                      )
                      .subscribe(resp => {
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
            cancelButtonText: "No"
          })
          .then(result => {
            if (result.value) {
              this.showLoading = true;
              this._accountSvc
                .resetUserSecurityQuestion(
                  this.UserEditing.UsrID,
                  this._userDetails.username,
                  this.userEmail
                )
                .subscribe(resp => {
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
  public onUsercreateClick = ($event: any) => {
    this.dropdownList = this.fiList;
    this.FiSelect = [];
    this.isEditM = false;
    if (this.adminUserModal.isOpen) return;

    this.emailAvailability = "";
    this.isDisabled = false;
    this.ProductAssignedselected = [];
    this.paSelected = [];
    this.intialvalue = 1;
    this.selectedFIID = 0;
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
          cancelButtonText: "No"
        })
        .then(result => {
          if (result.value) {
            this._accountSvc
              .changeSecondaryAuthLockStatus(
                this.currentUserId,
                this.SecondaryAuthUser,
                this.adminUserForm.controls["Email"].value
              )
              .subscribe(resp => {
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
          cancelButtonText: "No"
        })
        .then(result => {
          if (result.value) {
            this._accountSvc
              .changeUserLockStatus(this.currentUserId, this.userlockState)
              .subscribe(resp => {
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
    // console.log('Show Lock Status. Response: ' + JSON.stringify(data) );
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
    // console.log('Show Lock Status. Response: ' + JSON.stringify(data) );
    if (
      data === "undefined" ||
      data === null ||
      (data != null && data.message === null)
    ) {
      this._toastr.success(CONSTANTS.adminusermaintMsgs.success.lockstatus);
    }
  }
  public onUserSaveClick = () => {
    let data = this.adminUserForm.getRawValue();
    if (
      this.adminUserForm.invalid ||
      this.invalidPhoneLength ||
      this.invalidSecondaryPhoneLength ||
      this.invalidPhoneAltLength ||
      this.invalidEmail
    ) {
      this._toastr.error(CONSTANTS.genericCRUDMsgs.invalidInputs);
    } else if (data.Role == 0 || data.Role == "") {
      this._toastr.error(CONSTANTS.adminusermaintMsgs.error.invalidRole);
    } else {
      this.saving = true;

      data.Phone =
        this.adminUserForm.get("Phone").value != null
          ? this.adminUserForm.get("Phone").value.replace(/\D/g, "")
          : "";
      data.Phone2 =
        this.adminUserForm.get("Phone2").value != null
          ? this.adminUserForm.get("Phone2").value.replace(/\D/g, "")
          : "";
      this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);

      if (this.UserEditing.Username) data = _.merge(this.UserEditing, data);

      data.UserName = data.Username || 0;
      data.CreateBy = this._userDetails.username;
      data.UpdateBy = this._userDetails.username;
      // this.UsrSelectedProds.push(this.productId);
      data.PrdID = this.productId;
      data.ProductsAssigned = this.UsrSelectedProds;
      if (data.FIID == "" || data.FIID == null || data.FIID == " ") {
        data.FIID = 0;
      }
      if (this.UsrSelectedProds.length == 1) {
        // data.Role = 'Admin';
        data.IsSysAdmin = 0;
      }
      if (this.UsrSelectedProds.length > 1 && data.FIID == 0) {
        // data.Role = 'Admin';
        data.IsSysAdmin = 1;
      }
      if (this.UsrSelectedProds.length > 1 && data.FIID) {
        // data.Role = 'Admin';
        data.IsSysAdmin = 0;
      }
      if (data.FIID == null || data.FIID == "" || data.FIID == 0) {
        data.IsJHAUser = true;
      } else {
        data.IsJHAUser = false;
      }
      this.saving = true;

      if (this.UserEditing.Username) {
        data.UpdatedBy = this._userDetails.username;

        if (this.UserEditing.Username === this._userDetails.username) {
          this.saving = false;
          this._toastr.error(
            CONSTANTS.adminusermaintMsgs.error.invalidOperation
          );
        } else {
          if (!this.duplicateemail) {
            this.saving = true;
            data.IsLocked = this.userlockState; //this.lockuserStatus;
            data.IsMFAEnabled = true;
            data.IsMFALocked = this.SecondaryAuthUser; //this.lockSecondaryuserStatus;
            data.isProductSynced = false;
            if (
              data.FirstName === this.lepChange.FirstName &&
              data.LastName === this.lepChange.LastName &&
              data.Email === this.lepChange.Email &&
              data.Phone === this.lepChange.Phone
            ) {
              this._accountSvc.updateProductUserAccount(data).subscribe(
                response => {
                  if (response) {
                    this._getGridData();
                    this.adminUserModal.close();
                    this.UserEditing = null;
                    this.adminUserForm = null;
                    this.Confirmduplicateemail = "";

                    this.saving = false;
                    this._toastr.success(
                      CONSTANTS.adminusermaintMsgs.success.userUpdate
                    );
                  } else {
                    this.saving = false;
                    this._toastr.error(
                      CONSTANTS.adminusermaintMsgs.error.failSaveChanges
                    );
                  }
                },
                err => {
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
                  cancelButtonText: "No"
                })
                .then(result => {
                  if (result.value) {
                    this._accountSvc.updateProductUserAccount(data).subscribe(
                      response => {
                        if (response) {
                          this._getGridData();
                          this.adminUserModal.close();
                          this.UserEditing = null;
                          this.adminUserForm = null;
                          this.Confirmduplicateemail = "";

                          this.saving = false;
                          this._toastr.success(
                            CONSTANTS.adminusermaintMsgs.success.userUpdate
                          );
                        } else {
                          this.saving = false;
                          this._toastr.error(
                            CONSTANTS.adminusermaintMsgs.error.failSaveChanges
                          );
                        }
                      },
                      err => {
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
              CONSTANTS.adminusermaintMsgs.questions.emailDuplicateConfirm
            );
          }
        }
      } else {
        this.saving = true;
        data.UsrID = 0;
        data.IsLocked = false;
        data.IsMFAEnabled = true;
        data.IsMFALocked = false;
        this.IsUserExists(false);
        this.isUserEmailExists(false);

        if (!this.duplicateuser) {
          if (!this.duplicateemail) {
            this.saving = true;
            this._accountSvc.createProductUserAccount(data).subscribe(
              response => {
                this._getGridData();
                this.adminUserModal.close();
                this.UserEditing = null;
                this.adminUserForm = null;
                this.duplicateemail = false;
                this.saving = false;
                this._toastr.success(
                  CONSTANTS.adminusermaintMsgs.success.userSave
                );
              },
              err => {
                this.saving = false;
                this._toastr.error(
                  CONSTANTS.adminusermaintMsgs.error.failSaveChanges
                );
              }
            );
          } else {
            this.saving = false;
            this._toastr.error(
              CONSTANTS.adminusermaintMsgs.questions.emailDuplicateConfirm
            );
            this.adminUserForm.controls["Email"].setValue("");
           // this.duplicateemail = true;
          }
        } else {
          this.saving = false;
          this._toastr.error(
            CONSTANTS.adminusermaintMsgs.questions.userDuplicateConfirm
          );
          this.adminUserForm.controls["Username"].setValue("");
        }
      }
    }
  };

  private GetTotalProductscount() {
    this._prodSvc.RetrieveProduct(0, 0).subscribe(response => {
      this.totalproductcount = response.Data.length;
    });
  }

  private _getProdListSelectedFIIDs(action = null) {
    this.prodList = [];
    let prid = this.productId;
    if (this.selectedFIID < 0) {
      prid = 0;
    }

    this._prodSvc.RetrieveProduct(prid, 0).subscribe(
      response => {
        if (response && response.Data.length > 0) {
          response.Data.forEach((prod: ProductContext) => {
            this.prodList.push(prod);
          });
          this.ProductAssignedselected = this.prodList;
          this.ProductAssginedSelectedAll(this.prodList);
          return true;
        }
      },
      (err: any) => {
        this._toastr.error(CONSTANTS.adminusermaintMsgs.error.failLoadProducts);
        return false;
      }
    );
  }

  private _getProdFIIDs() {
    this.loadingFIDs = true;
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    if (this.productId != null && this._userDetails != null) {
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
            }
          },
          (err: any) => {
            this.loadingFIDs = false;
          }
        );
    }
    //this._filterFiLists();
    this.loadingFIDs = false;
  }

  FIChange(FIlist) {
    this.selectedFIID = FIlist.FIID;
    this.adminUserForm.controls["FIID"].setValue(this.selectedFIID);
    this.adminUserForm.controls["FIName"].setValue(FIlist.Name);
    if ((this.selectedFIID = 0)) {
      this.adminUserForm.controls["FIID"].setValue(0);
      this.adminUserForm.controls["FIName"].setValue("");
    }
    this._getProdListSelectedFIIDs();
  }

  FIDeChange() {
    this.selectedFIID = 0;
    this.adminUserForm.controls["FIID"].setValue(0);
  }

  ProductAssginedSelectedAll(SelectedProductAssigned) {
    let pdata = [];
    pdata = this.prodList;
    let i;
    this.UsrSelectedProds = [];
    for (i = 0; i < SelectedProductAssigned.length; i += 1) {
      pdata.forEach(element => {
        if (element.PrdID == SelectedProductAssigned[i].PrdID) {
          this.UsrSelectedProds.push(SelectedProductAssigned[i].PrdID);
        }
      });
    }
  }
  ProductAssginedSelectedDeAll(SelectedProductAssigned) {
    this.UsrSelectedProds = [];
  }
  ProductAssginedSelectedOne(SelectedProductAssigned) {
    let pdata = [];
    pdata = this.prodList;
    let i;
    pdata.forEach(element => {
      if (element.PrdID == SelectedProductAssigned.PrdID) {
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
      if (pdata[i] == SelectedProductAssigned.PrdID) {
        pdata.splice(i, 1);
      }
    }
    this.UsrSelectedProds = pdata;
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
    this.users = [];
    this.loading = true;
    this._accountSvc.getUserAccountDetails(this.productId).subscribe(
      response => {
        // let users =  response;
        //this.users = response;
        if (response && response.length > 0) {
          response.forEach((user: UserDetailContext) => {
            if (user.FIID === null) {
              user.FIID = "";
            }
            this.users.push(user);
          });
          this.usersList = this.users;
        }
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
      }
    );
    // //mockup data flow
    // this.users =    this._accountSvc.getUserList();
    //  if(this.users.length > 0 )
    //  {
    //  this.loading = true;
    //  this._setGridData();
    //  }
    //  //mockup data flow
  }

  // private _setGridData(users?: UserDetailContext[]) {
  //   if (this.grid) {
  //     this.grid.setRowData(users || this.users || []);
  //   }
  //   //this.grid.setRowData(users || []);
  // }
  public onUserEditClick = (data: any) => {
    this.dropdownList = this.fiList;
    this.FiSelect = [];
    this.emailAvailability = "";
    this.isEditM = true;
    this.isDisabled = false;
    this.ProductAssignedselected = [];
    this.paSelected = [];
    this.intialvalue = 0;
    this.selectedFIID =
      data.data.FIID && data.data.FIID != null ? data.data.FIID : 0;
    this._getProdListSelectedFIIDs(data.data.ProductAssigned);
    this._buildUserForm(data.data);
    this.HighlightedProducts = data.data.ProductName;
    this.selectedProdsinlist = [data.data.ProductName];
    let ed = Object.assign({}, data.data);
    this.lepChange = ed;
    this.userlockState = data.data.IsLocked;
    this.SecondaryAuthUser = data.data.IsMFALocked;
    this.adminUserModal.open();
  };

  public onUserDeleteClick = (data: any, node: any) => {
    (Swal as any)
      .fire({
        title: CONSTANTS.adminusermaintMsgs.questions.itemDeleteConfirm,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      })
      .then(result => {
        if (result.value) {
          this._accountSvc
            .deleteUserAccount(data.data.UsrID, data.data.PrdID)
            .subscribe(response => {
              let index = this.users.findIndex((u: UserDetailContext) => {
                return data.data.UsrID === u.UsrID;
              });

              if (index >= 0) this.users.splice(index, 1);

              (Swal as any).fire(
                "Deleted!",
                "Product has been de-assigned successfully!",
                "success"
              );
              this._getGridData();
            });

          (Swal as any).fire(
            "Deleted!",
            "User deleted successfully",
            "success"
          );
        }
      });
  };

  private _buildUserForm(
    userlist: UserDetailContext = new UserDetailContext()
  ) {
    this.UserEditing = userlist;
    if (this.UserEditing.UsrID) {
      if (this.UserEditing.Phone != null && this.UserEditing.Phone != "") {
        this.UserEditing.Phone = this.UserEditing.Phone.replace(
          /\D/g,
          ""
        ).replace(/^(\d{0,3})(\d{0,3})(.*)/, "($1) $2-$3");
      }
      if (this.UserEditing.Phone2 != null && this.UserEditing.Phone2 != "") {
        this.UserEditing.Phone2 = this.UserEditing.Phone2.replace(
          /\D/g,
          ""
        ).replace(/^(\d{0,3})(\d{0,3})(.*)/, "($1) $2-$3");
      }
      this.isEditDisabled = true;
      let Fi =
        this.UserEditing.FIID && this.UserEditing.FIID != null
          ? this.UserEditing.FIID
          : " ";
      if (this.UserEditing.FIID != "" && this.UserEditing.FIID != "0") {
        let fid: number = Number(this.UserEditing.FIID);
        let filists: any = this.fiList;
        filists.forEach(element => {
          if (element.FIID == fid) {
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
        ProductAssigned: new FormControl(this.UserEditing.ProductName),
        Role: new FormControl(this.UserEditing.Role),
        PasswordStatus: new FormControl(this.UserEditing.PasswordStatus),
        Extension: new FormControl(this.UserEditing.Extension)
      });
    } else {
      this.isEditDisabled = false;
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
        PasswordStatus: new FormControl("Active")
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
  }
}
