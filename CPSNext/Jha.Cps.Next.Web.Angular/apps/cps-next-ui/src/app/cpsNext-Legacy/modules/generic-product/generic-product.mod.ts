import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '@app/modules/shared/shared.mod';
import {routing} from './generic-product.routing';
import { FormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CM_WrapperComponent } from './wrapper.comp';

import {
  FiOnboardingPage,
  InfoPage,
  ConfigParametersPage,
  ProductUserAdministrationPage,
  MastercardFeeRateMaintenancePage,
  ICAMaintenancePage,
  RTP_TransactionActivityPage,
  ServiceInstanceComponent,
  StatusReportPage,
  ServiceActivityPage,
  TransactionActivityPage,
  DetailsComponent,
  VersionComponent,
  ProcessViewErrorPage
} from './pages';

const COMPONENTS = [
  FiOnboardingPage,
  InfoPage,
  ConfigParametersPage,
  ProductUserAdministrationPage,
  MastercardFeeRateMaintenancePage,
  ICAMaintenancePage,
  RTP_TransactionActivityPage,
  ServiceInstanceComponent,
  StatusReportPage,
  ServiceActivityPage,
  TransactionActivityPage,
  CM_WrapperComponent,
  DetailsComponent,
  VersionComponent,
  ProcessViewErrorPage
];

import {
  ActivityItemPipe,
  SearchTimeRangePipe
} from '@modules/generic-product/pipes';

const PIPES = [
  ActivityItemPipe,
  SearchTimeRangePipe
];

const SERVICES = [];


@NgModule({
  declarations: [
    ...COMPONENTS,
    ...PIPES
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
    routing,
    FormsModule,
    MatSlideToggleModule, MatTooltipModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  providers: [
    ...SERVICES
  ]
})

export class GenericProductModule {}
