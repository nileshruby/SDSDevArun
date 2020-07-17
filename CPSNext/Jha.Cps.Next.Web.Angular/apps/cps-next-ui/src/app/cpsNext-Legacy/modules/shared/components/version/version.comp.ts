import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  OnChanges,
  ViewChildren,
  AfterViewInit,
  QueryList,
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
  LoggingService,
  ProductService,
  SessionService,
  VaultService
} from "@app/services";
import { LocalModalComponent } from "@shared/components";
import {
  IProductActivitySearch,
  IProductVersion,
  IProductVersionNote
} from "@entities/models";
import { CONSTANTS } from "@entities/constants";
import { UserContext } from "./../../../../entities/user-context";
import { PRODUCT_IDS } from "@entities/product-ids";

import * as moment from "moment";
import * as _ from "lodash";
import { DialogConfig, DialogTypes } from "@entities/dialog";
import Swal from "sweetalert2";
import { APP_KEYS } from "@app/entities/app-keys";
import { LazyLoadEvent, SortEvent } from "primeng/api";
import { Subscription } from "rxjs";

@Component({
  selector: "version",
  styleUrls: ["./version.scss"],
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./version.html"
})
export class VersionComponent
  implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  protected readonly CLASSNAME = "VersionComponent";
  @Input() productId;
  Heading: string;

  @ViewChildren("versionModal") versionModalQuery: QueryList<
    LocalModalComponent
  >;
  @ViewChildren("noteModal") noteModalQuery: QueryList<LocalModalComponent>;
  versionModalQuerySubscription: Subscription;
  noteModalQuerySubscription: Subscription;
  versionModal: LocalModalComponent;
  noteModal: LocalModalComponent;

  public loading = false;
  public saving = false;
  public _userDetails: UserContext = null;
  public items: IProductVersion[] = null;

  public versionEditing: IProductVersion = null;
  public versionForm: FormGroup;

  public noteEditing: IProductVersionNote = null;
  public noteForm: FormGroup;
  public SearchForm: FormGroup;

  private parentversionId = 0;
  private mainversionId;
  productionInputDate: string;
  cols: any[] = [];
  expandedRows: any[] = [];
  versionList: any = [];

  constructor(
    private _fb: FormBuilder,
    private _prodSvc: ProductService,
    private _dialogSvc: DialogService,
    private _toastr: ToastrService,
    private _valutService: VaultService,
    private _sessionSvc: SessionService,
    private _log: LoggingService
  ) {}
  ngOnInit() {
    this.cols = [
      { field: "version", header: "Version" },
      { field: "released", header: "Released?" },
      { field: "releaseOrProductionDate", header: "REL/PROD Date" },
      { field: "createdBy", header: "Created By" },
      { field: "createDate", header: "Created Date" },
      { field: "updatedBy", header: "Modified By" },
      { field: "updateDate", header: "Modified Date" }
    ];
    this._getGridData();
    this.SearchForm = this._fb.group({
      searchversion: new FormControl("")
    });
    let productList = this._valutService.get(APP_KEYS.userContext);
    if (productList != null) {
      productList.assginedProducts.forEach(prod => {
        if (prod.productId == this.productId) {
          this.Heading = prod.productName;
        }
      });
    }
    
    this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
  }

  ngAfterViewInit() {
    this.versionModalQuerySubscription = this.versionModalQuery.changes.subscribe(
      (ql: QueryList<LocalModalComponent>) => {
        this.versionModal = ql.first;
        this.versionModalQuerySubscription.unsubscribe();
      }
    );
    this.noteModalQuerySubscription = this.noteModalQuery.changes.subscribe(
      (ql: QueryList<LocalModalComponent>) => {
        this.noteModal = ql.first;
        this.noteModalQuerySubscription.unsubscribe();
      }
    );
  }

  ngOnDestroy() {
    this.versionModalQuerySubscription.unsubscribe();
    this.noteModalQuerySubscription.unsubscribe();
  }

  ngOnChanges() {
    this._getGridData();
    this.SearchForm = this._fb.group({
      searchversion: new FormControl("")
    });
    let productList = this._valutService.get(APP_KEYS.userContext);
    if (productList != null) {
      productList.assginedProducts.forEach(prod => {
        if (prod.productId == this.productId) {
          this.Heading = prod.productName;
        }
      });
    }
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
    searchText = searchText.toUpperCase();
  }
  public RefreshFilterboxGrid(dataTable: any) {
    this.onSearch("", dataTable);
  }

  public onVersionCreateClick = ($event: any) => {
    if (this.versionModal.isOpen || this.noteModal.isOpen) return;

    this._buildVersionForm();
    this.versionModal.open();
  };

  public onVersionEditClick = (data: any) => {
    this._buildVersionForm(data.data);
    this.versionModal.open();
  };

  public onKeyUpDate = value => {
    this.productionInputDate = value;
  };

  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let date1 = new Date(value1);
      let value2 = data2[event.field];
      let date2 = new Date(value2);
      let result = null;
      let test1 = new Date(value1);
 
      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } 
      else if(event.field == 'version'){
       if (typeof value1 === 'string' && typeof value2 === 'string') {
      result =  result = (value1 < value2 ? -1 : 1)}}
      else {
        result = date1 < date2 ? -1 : date1 > date2 ? 1 : 0;
      }
 
      return result * event.order;
    });
  }

  public onVersionSaveClick = () => {
    let parentVersionmainid;
    if (this.versionForm.invalid) {
      this._toastr.error(CONSTANTS.genericCRUDMsgs.invalidInputs);
    } else {
      let model = this._getValidVersionFormModel();

      if (!model) return;
      
      if (this.versionEditing.versionId)
        model = _.merge(this.versionEditing, model);

      this._userDetails = this._sessionSvc.get(APP_KEYS.userContext);
      model.productId = this.productId;
      model.versionId = model.versionId || 0;
      model.note = model.note;
      model.createdBy = this._userDetails.username; 

      let Versionnote = model.note;

      this._log.debug(
        `${this.CLASSNAME} > onVersionSaveClick() > versionForm: `,
        model
      );
      this.saving = true;
      this._prodSvc.saveProductVersion(model).subscribe(
        response => {
          if (response.errorMessages && response.errorMessages.length) {
            response.errorMessages.forEach((msg: string) => {
              this._toastr.error(msg);
            });
            return;
          }

          if (response.data && response.data.versionId) {
            parentVersionmainid = response.data.versionId;
            this.mainversionId = parentVersionmainid;
            let index = this.items.findIndex((v: IProductVersion) => {
              return v.versionId === response.data.versionId;
            });

            if (index >= 0)
              // UPDATE
              this.items.splice(index, 1, this._evalVersion(response.data));
            // SAVE
            else this.items.push(this._evalVersion(response.data));
          }

          if (!this.versionEditing.versionId) {
            this.parentversionId = parentVersionmainid;
            this.SaveNote(parentVersionmainid, Versionnote);
          }

          this.versionModal.close();
          this.versionEditing = null;
          this.versionForm = null;
          this._toastr.success(
            CONSTANTS.sharedComponentMsgs.version.saveVersion
          );
        },
        err => {
          this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
        },
        () => {
          this.saving = false;
        }
      );
    }
  };

  private _evalNotes(notes: IProductVersionNote[] = []) {
    notes.forEach(this._evalNote);

    return notes;
  }

  private _evalNote(note: IProductVersionNote) {
    if (!note) return note;

    if (note.createDate) {
      note.createDate = moment(note.createDate).format("MMM DD, YYYY HH:mm:ss");
    }

    return note;
  }

  SaveNote(parentversionid, parentVersionnote) {
    let model: any = {};
    model.versionid = parentversionid;
    model.noteid = 0;
    model.note = parentVersionnote;
    model.CreatedBy = this._userDetails.username;
    this.saving = true;
    this._prodSvc.saveVersionNote(model).subscribe(
      response => {
        if (response.data && response.data.noteId) {
          let version = this.items.find((v: IProductVersion) => {
            return v.versionId === response.data.versionId;
          });

          if (!version) {
            // Something went wrong. Reset!
          } else {
            version.notes = version.notes || [];

            let index = version.notes.findIndex((n: IProductVersionNote) => {
              return n.noteId === response.data.noteId;
            });

            if (index >= 0)
              // UPDATE
              version.notes.splice(index, 1, this._evalNote(response.data));
            // SAVE
            else version.notes.push(this._evalNote(response.data));
          }
        }
        this._getGridData();
        this.noteModal.close();
        this.noteEditing = null;
        this.noteForm = null;

        this.saving = false;
      },
      err => {
        this.saving = false;
        this._toastr.error(CONSTANTS.sharedComponentMsgs.version.failSaveNotes);
      }
    );
  }

  public onVersionCancelClick = (data: any, node: any) => {
    this.versionModal.close();
    this.versionEditing = null;
    this.versionForm = null;
  };

  public onVersionDeleteClick = (data: any, node: any) => {
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
            .deleteProductVersion(data.data.versionId)
            .subscribe(response => {
              let index = this.items.findIndex((i: IProductVersion) => {
                return data.data.versionId === i.versionId;
              });

              if (index >= 0) this.items.splice(index, 1);

              this._toastr.success(
                CONSTANTS.sharedComponentMsgs.version.deleteVersion
              );
              this._getGridData();
            });
        }
      });
  };

  public onNoteCreateClick = (params: any) => {
    this._log.debug(`${this.CLASSNAME} > onNoteCreateClick()`);
    if (!params || !params.data || !params.data.versionId) return;

    if (this.noteModal.isOpen) return;
    this.parentversionId = params.data.versionId;
    this._buildNoteForm(params.data.versionId);
    this.noteModal.open();
  };

  public onNoteEditClick = (params: any) => {
    this._log.debug(`${this.CLASSNAME} > onNoteEditClick() > params: `, params);

    if (!params || !params.data || !params.data.versionId) return;

    if (this.noteModal.isOpen) return;

    this._buildNoteForm(params.data.versionId, params.data);
    this.noteModal.open();
  };

  public onNoteSaveClick = () => {
    // this._log.debug(`${this.CLASSNAME} > onNoteSaveClick()`);
    if (this.noteForm.invalid) {
      this._toastr.error(CONSTANTS.sharedComponentMsgs.version.invalidNote);
    } else {
      let model = this._getValidNoteFormModel();

      if (!model) return;

      if (this.noteEditing.noteId) model = _.merge(this.noteEditing, model);

      if (!model.versionId) {
        model.versionId = this.parentversionId;
      }
      model.noteId = model.noteId || 0;

      model.CreatedBy = this._userDetails.username;
      this._log.debug(
        `${this.CLASSNAME} > onNoteSaveClick() > noteForm: `,
        model
      );

      this.saving = true;
      this._prodSvc.saveVersionNote(model).subscribe(
        response => {
          if (response.data && response.data.noteId) {
            let version = this.items.find((v: IProductVersion) => {
              return v.versionId === response.data.versionId;
            });

            if (!version) {
              // Something went wrong. Reset!
              // this._getGridData();
            } else {
              version.notes = version.notes || [];

              let index = version.notes.findIndex((n: IProductVersionNote) => {
                return n.noteId === response.data.noteId;
              });

              if (index >= 0)
                // UPDATE
                version.notes.splice(index, 1, this._evalNote(response.data));
              // SAVE
              else version.notes.push(this._evalNote(response.data));
            }
          }

          this._getGridData();
          this.noteModal.close();
          this.noteEditing = null;
          this.noteForm = null;

          this.saving = false;
          this._toastr.success(CONSTANTS.sharedComponentMsgs.version.saveNote);
        },
        err => {
          this.saving = false;
          this._toastr.error(CONSTANTS.genericCRUDMsgs.saveFailed);
        }
      );
    }
  };

  public onNoteCancelClick = (data: any, node: any) => {
    // this._log.debug(`${this.CLASSNAME} > onNoteCancelClick()`);

    this.noteModal.close();
    this.noteEditing = null;
    this.noteForm = null;
  };

  public onNoteDeleteClick = (data: any, node: any) => {
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
            .deleteVersionNote(data.data.noteId)
            .subscribe(response => {
              let version = this.items.find((i: IProductVersion) => {
                return data.data.versionId === i.versionId;
              });

              if (version) {
                let index = version.notes.findIndex(
                  (i: IProductVersionNote) => {
                    return data.data.noteId === i.noteId;
                  }
                );

                if (index >= 0) version.notes.splice(index, 1);
              }
              this._toastr.success(
                CONSTANTS.sharedComponentMsgs.version.deleteNote
              );
              this._getGridData();
            });
        }
      });
  };

  private _getGridData() {
    this.loading = true;
    this._prodSvc.getProductVersions(this.productId).subscribe(
      response => {
        this.items = this._evalVersions(response.data || []);
        this.loading = false;
        this.versionList = this.items;
      },
      (err: any) => {
        this.loading = true;
      }
    );
  }

  // Validates form and returns a valid model, or null.
  private _getValidVersionFormModel() {
    if (!this.versionForm) return null;

    let valid = true,
      warnings = [];

    let model: any = {};

    // VERSION
    try {
      model.version = this.versionForm.controls["version"].value;
    } catch (err) {
      model.version = null;
    }

    if (!model.version) {
      this._toastr.error(CONSTANTS.sharedComponentMsgs.version.invalidVersion);
      return null;
    }

    // RELEASED
    try {
      model.released = this.versionForm.controls["released"].value === true;
    } catch (err) {
      model.released = false;
    }

    // RELEASE DATE
    try {
      model.releaseOrProductionDate = this.versionForm.controls[
        "releaseOrProductionDate"
      ].value;
      if (this.productionInputDate) {
        model.releaseOrProductionDate = this.productionInputDate;
      }

      // Remove time & convert to string
      if (moment.isMoment(model.releaseOrProductionDate)) {
        model.releaseOrProductionDate.set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        });
        model.releaseOrProductionDate = model.releaseOrProductionDate.format();
      }
    } catch (err) {
      model.releaseOrProductionDate = null;
    }

    if (!model.releaseOrProductionDate) {
      this._toastr.error(
        CONSTANTS.sharedComponentMsgs.version.invalidReleaseDate
      );
      return null;
    }

    // NOTE - Only for Version Create
    if (this.versionEditing && !this.versionEditing.versionId) {
      try {
        model.note = this.versionForm.controls["note"].value;
      } catch (err) {
        model.note = null;
      }

      if (!model.note) {
        this._toastr.error(CONSTANTS.sharedComponentMsgs.version.invalidNote);
        return null;
      }
    }

    return model;
  }

  // Validates form and returns a valid model, or null.
  private _getValidNoteFormModel() {
    if (!this.noteForm) return null;

    let valid = true,
      warnings = [];

    let model: any = {};

    // NOTE
    try {
      model.note = this.noteForm.controls["note"].value;
    } catch (err) {
      model.note = null;
    }

    if (!model.note) {
      this._toastr.error(CONSTANTS.sharedComponentMsgs.version.invalidNote);
      return null;
    }

    return model;
  }

  private _evalVersions(versions: IProductVersion[] = []) {
    versions.forEach(this._evalVersion);

    return versions;
  }

  private _evalVersion(version: IProductVersion) {
    if (!version) return version;

    if (version.releaseOrProductionDate) {
      version.releaseOrProductionDate = moment(
        version.releaseOrProductionDate
      ).format("MMM DD, YYYY");
    }

    if (version.createDate) {
      version.createDate = moment(version.createDate).format(
        "MMM DD, YYYY HH:mm:ss"
      );
    }

    if (version.updateDate) {
      version.updateDate = moment(version.updateDate).format(
        "MMM DD, YYYY HH:mm:ss"
      );
    }

    if (version.notes && version.notes.length) {
      version.notes.forEach((n: IProductVersionNote) => {
        if (n.createDate) {
          n.createDate = moment(n.createDate).format("MMM DD, YYYY HH:mm:ss");
        }
      });
    }

    return version;
  }

  private _buildVersionForm(version: IProductVersion = {}) {
    this.versionEditing = version;

    if (this.versionEditing.versionId) {
      this.versionForm = this._fb.group({
        version: new FormControl(
          this.versionEditing.version,
          Validators.required
        ),
        released: new FormControl(this.versionEditing.released),
        releaseOrProductionDate: new FormControl(
          moment(this.versionEditing.releaseOrProductionDate),
          Validators.required
        )
      });
    } else {
      this.versionForm = this._fb.group({
        version: new FormControl("", Validators.required),
        released: new FormControl(false),
        releaseOrProductionDate: new FormControl(moment(), Validators.required),
        note: new FormControl("", Validators.required)
      });
    }
  }

  private _buildNoteForm(versionId: number, note: IProductVersionNote = {}) {
    this.noteEditing = note;

    if (this.noteEditing.noteId) {
      this.noteForm = this._fb.group({
        versionId: new FormControl(versionId),
        note: new FormControl(this.noteEditing.note, Validators.required)
      });
    } else {
      this.noteForm = this._fb.group({
        versionId: new FormControl(versionId),
        note: new FormControl("", Validators.required)
      });
    }
  }

  public collapseAll() {
    this.expandedRows = [];
  }
}
