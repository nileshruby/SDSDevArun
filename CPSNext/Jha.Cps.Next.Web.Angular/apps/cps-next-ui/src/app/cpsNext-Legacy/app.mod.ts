// import { AwardsComponent } from './modules/awards/awards.component';
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SlickCarouselModule } from "@node_modules/ngx-slick-carousel";
import { ToastrModule } from "@node_modules/ngx-toastr";
import { SharedModule } from "@modules/shared/shared.mod";
import { routing } from "./app.routing";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { HighlightModule } from "ngx-highlightjs";
import { DragDropModule } from "@angular/cdk/drag-drop";
import xml from "highlight.js/lib/languages/xml";
import scss from "highlight.js/lib/languages/scss";
import { ErrorInterceptor } from "@app/interceptors/httpErrorInterceptor";
import {
  AppComponent,
  LazyLoadedModuleComponent,
  ShellComponent
} from "./components";
import {
  DashboardPage,
  DashboardIntroductionComponent,
  DashboardProductDetailsComponent,
  DashboardProductComponent,
  LoginPage,
  LogoffPage,
  ErrorPageComponent,
  ProfilePage,
  ProfileDetailsComponent,
  ProfilePasswordComponent,
  ProfileSecurityQuestionComponent
} from "./pages";

const COMPONENTS = [
  AppComponent,
  LazyLoadedModuleComponent,
  ShellComponent,

  DashboardPage,
  DashboardIntroductionComponent,
  DashboardProductDetailsComponent,
  DashboardProductComponent,

  LoginPage,
  LogoffPage,
  ErrorPageComponent,

  ProfilePage,
  ProfileDetailsComponent,
  ProfilePasswordComponent,
  ProfileSecurityQuestionComponent
  // , AwardsComponent
];

import {
  AccountService,
  AppConfigService,
  AuthGuardService,
  BroadcastService,
  DialogService,
  FiService,
  HelpersService,
  HttpBaseService,
  LoggingService,
  ModalService,
  NavigationService,
  ProductService,
  SessionService,
  StartupService,
  VaultService
  ,  AwardsService
} from "./services";

const SERVICES = [
  AccountService,
  AppConfigService,
  AuthGuardService,
  BroadcastService,
  DialogService,
  FiService,
  HelpersService,
  HttpBaseService,
  LoggingService,
  ModalService,
  NavigationService,
  ProductService,
  SessionService,
  StartupService,
  VaultService,
  UrlResolver,
  SingletonService
  ,  AwardsService
];

export function init_app(appLoadService: StartupService) {
  return () => appLoadService.initializeApp();
}
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { UrlResolver } from "./services/url-reolver";
import { SingletonService } from "./services/singleton.svc";
import { InsertHeadersInterceptor } from "./interceptors/insert-headers-interceptor";
@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    SlickCarouselModule,
    SharedModule.forRoot(),
    ToastrModule.forRoot(),
    HighlightModule.forRoot({
      languages: hljsLanguages
    }),
    routing,
    NgMultiSelectDropDownModule.forRoot(),
    SweetAlert2Module.forRoot(),
    DragDropModule
  ],
  providers: [
    ...SERVICES,
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [StartupService],
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InsertHeadersInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
export function hljsLanguages() {
  return [
    { name: "scss", func: scss },
    { name: "xml", func: xml }
  ];
}
