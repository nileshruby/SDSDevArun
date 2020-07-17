import { Component } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuardService, AccountService } from "@app/services";
import { LazyLoadedModuleComponent } from "@app/components";
import {
  DashboardPage,
  LoginPage,
  LogoffPage,
  ProfilePage,
  ErrorPageComponent
} from "@app/pages";
import { CONSTANTS } from "@entities/constants";
import { ResetSecurityQuestionComponent } from "./modules/shared/components";
import { UrlResolver } from "./services/url-reolver";
import { ResetPasswordComponent } from "./modules/shared/components/reset-password/reset-password.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full"
  },
  {
    path: "error",
    component: ErrorPageComponent
  },
  {
    path: "login",
    resolve: { url: UrlResolver },
    component: LoginPage
  },
  {
    path: "logoff",
    resolve: { url: UrlResolver },
    component: LogoffPage
  },
  {
    path: "profile",
    canActivate: [AuthGuardService],
    resolve: { url: UrlResolver },
    component: ProfilePage
  },
  {
    path: "dashboard",
    canActivate: [AuthGuardService],
    resolve: { url: UrlResolver },
    component: DashboardPage
  },
  {
    path: "resetPassword",
    resolve: { url: UrlResolver },
    component: ResetPasswordComponent
  },
  {
    path: "resetQuestion",
    component: ResetSecurityQuestionComponent,
    resolve: { url: UrlResolver },
    canActivate: [AccountService]
  },
  {
    path: "Security",
    resolve: { url: UrlResolver },
    children: [
      {
        path: "ResetUserPassword/:token",
        component: ResetPasswordComponent
      },
      {
        path: "ResetQuestion/:token",
        component: ResetSecurityQuestionComponent
      }
    ]
  },
  {
    path: CONSTANTS.app.adminRouteBase,
    component: LazyLoadedModuleComponent,
    resolve: { url: UrlResolver },
    canActivate: [AuthGuardService],
    loadChildren: "./modules/admin/admin.mod#GlobalAdminModule"
  },
  {
    path: CONSTANTS.app.productsRouteBase,
    component: LazyLoadedModuleComponent,
    resolve: { url: UrlResolver },
    canActivate: [AuthGuardService],
    children: [
      {
        path: ":param",
        canActivate: [AuthGuardService],
        loadChildren:
          "./modules/generic-product/generic-product.mod#GenericProductModule"
      }
    ]
  },
  {
    path: "**",
    component: ErrorPageComponent
  }
];

export const routing = RouterModule.forRoot(routes, {
  onSameUrlNavigation: "reload"
});
