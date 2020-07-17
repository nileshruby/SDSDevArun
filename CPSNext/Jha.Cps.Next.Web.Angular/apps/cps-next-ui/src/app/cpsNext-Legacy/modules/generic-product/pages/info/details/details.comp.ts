import {Component, OnInit, ViewEncapsulation, Input, OnChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {LoggingService, ProductService} from '@app/services';
import {IContactDetails, ProductContext} from '@entities/models';
import {PRODUCT_IDS} from '@entities/product-ids';

import * as _ from 'lodash';

@Component({
  selector: 'cm-details',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './details.html',
  styleUrls: ['./details.scss']
}) 

export class DetailsComponent implements OnChanges {
  protected readonly CLASSNAME = 'DetailsComponent';

  public product: ProductContext;
  public primContact: IContactDetails = null;
  public showEditButton = false;
  public editMode = false;
  public loading = false;
  public detailsForm: FormGroup;
  @Input() productId;
  constructor(private _fb: FormBuilder,
              private _prodSvc: ProductService) {
  }

  ngOnChanges() {
    this.loading = true;
    this._prodSvc.getProducts().subscribe(
      response => {

        if (response && response.length) {
          this.product = response.find((product: ProductContext) => {
            return product.productId === this.productId;
          });

          if (this.product && this.product.contacts) {
            this.primContact = this.product.contacts.find((c: IContactDetails) => {
              return c.isPrimary;
            });
          }
        }
        this.loading = false;
      });

    //TODO: Get and eval user permissions
    // this._evalUserPermissions();
  }

  public onDetailsEditClick() {
    this._buildEditForm();
    this.editMode = true;
  }

  public onFormSubmit() {
    let editedProduct = _.merge(this.product, this.detailsForm.getRawValue());

    this.loading = true;
    this._prodSvc.saveProduct(editedProduct).subscribe(
      response => {
        if (response.data)
          this.product = response.data;

        this.loading = false;
        this.editMode = false;
      });
  }

  public onCancelClick() {
    this.editMode = false;
  }

  private _buildEditForm() {
    this.detailsForm = this._fb.group({
      productName: new FormControl(this.product.productName, Validators.required),
      versionNumber: new FormControl(this.product.versionNumber, Validators.required),
      shortDesc: new FormControl(this.product.shortDesc, Validators.required),
      longDesc: new FormControl(this.product.longDesc, Validators.required),
      contactName: new FormControl(this.product.contactName, Validators.required),
      contactEmail: new FormControl(this.product.contactEmail, Validators.required),
      supportNumber: new FormControl(this.product.supportNumber, Validators.required),
    });
  }

  private _evalUserPermissions() {
    this.showEditButton = true;
  }
}
