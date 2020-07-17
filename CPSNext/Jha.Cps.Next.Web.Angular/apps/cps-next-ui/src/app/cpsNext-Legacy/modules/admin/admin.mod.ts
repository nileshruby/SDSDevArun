import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';

import {SharedModule} from '@app/modules/shared/shared.mod';
import { MatSelectModule } from '@angular/material/select';
import {routing} from './admin.routing';
// import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { TableModule } from 'primeng/table';
 
import {GA_WrapperComponent} from './wrapper.comp';
import {
  GA_FiAdminPage,

  GA_ProductMaintPage
} from './pages';

const COMPONENTS = [
  GA_FiAdminPage,

  GA_ProductMaintPage,

  GA_WrapperComponent
];


import {
  AdminAuthGuardService
} from './services';

import { AdminuserMaintComponent } from './pages/adminuser-maint/adminuser-maint.component';
import { ServiceHostComponent } from './pages/service-host/service-host.component';
const SERVICES = [
  AdminAuthGuardService
];
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
@NgModule({
  declarations: [
    ...COMPONENTS,
    AdminuserMaintComponent,
    ServiceHostComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
    routing,
    FormsModule,
    TableModule,
    MatSlideToggleModule,
    MatSelectModule,
    NgMultiSelectDropDownModule.forRoot(),
    SweetAlert2Module.forRoot(),
  ],
  providers: [
    ...SERVICES
  ]
})

export class GlobalAdminModule {
}
