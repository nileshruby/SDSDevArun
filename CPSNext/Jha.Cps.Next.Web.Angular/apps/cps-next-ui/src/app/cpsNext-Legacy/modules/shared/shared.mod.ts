import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import {
  DatePickerComponent,
  DialogComponent,
  AppFooterComponent,
  AppHeaderComponent,
  HeaderSessionTimerComponent,
  LoadingAnimComponent,
  LocalModalComponent,
  ModalComponent,
  ModuleNavItemComponent,
  ModuleNavComponent,
  ModuleNavItemTooltipComponent,
  ModuleWrapperComponent,
  SearchBoxComponent,
  ResetSecurityQuestionComponent
} from "./components";

const COMPONENTS = [
  DatePickerComponent,
  DialogComponent,
  AppFooterComponent,
  AppHeaderComponent,
  HeaderSessionTimerComponent,
  LoadingAnimComponent,
  LocalModalComponent,
  ModalComponent,
  ModuleNavItemComponent,
  ModuleNavComponent,
  ModuleNavItemTooltipComponent,
  ModuleWrapperComponent,
  SearchBoxComponent,
  ResetPasswordComponent,
  ResetSecurityQuestionComponent,
  ProductUsersPageComponent,
  FiOnboardingPage,
  ServiceInstanceComponent,
  VersionComponent,
  ConfigParametersPage
];

import {
  ContentHeightDirective,
  ImgSrcDirective,
  InputValidateDirective,
  PhoneNumberDirective,
  SecureInputValidateDirective
} from "./directives";

const DIRECTIVES = [
  ContentHeightDirective,
  ImgSrcDirective,
  PhoneNumberDirective,
  InputValidateDirective,
  SecureInputValidateDirective
];

import { ProductConfigPipe, RemainingTimePipe, PhoneFormatPipe } from "./pipes";
import { HighlightModule } from "ngx-highlightjs";
import { ProductUsersPageComponent } from "./components/prod-users/prod-users.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { FiOnboardingPage } from "./components/fi-onboarding/fi-onboarding.page";
import { ServiceInstanceComponent } from "./components/service-instance/service-instance.component";
import { ConfigParametersPage } from "./components/config-parameters/config-parameters.page";
import { TableModule } from "primeng/table";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { VersionComponent } from "./components/version/version.comp";

const PIPES = [ProductConfigPipe, RemainingTimePipe, PhoneFormatPipe];

const SERVICES = [
  // AgGridService,
  // DialogService,
  // HelpersService,
  // LoggingService,
  // ModalService
];

@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    MatSlideToggleModule,
    MatTooltipModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [...SERVICES],
  exports: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
    HighlightModule,
    TableModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [...SERVICES]
    };
  }
}
