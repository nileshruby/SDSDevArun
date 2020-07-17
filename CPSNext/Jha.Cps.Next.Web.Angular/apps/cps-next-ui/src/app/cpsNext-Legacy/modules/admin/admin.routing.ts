import {Routes, RouterModule, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

import { ServiceHostComponent } from './pages/service-host/service-host.component';
import { AdminuserMaintComponent } from './pages/adminuser-maint/adminuser-maint.component';
import {AdminAuthGuardService} from '@modules/admin/services';
import {GA_WrapperComponent} from './wrapper.comp';
import {
  GA_FiAdminPage,
  GA_ProductMaintPage
} from './pages';

const routes: Routes = [
  {
    path: '',
    component: GA_WrapperComponent,
    children: [
      {
        path: 'fiadmin',
        component: GA_FiAdminPage,
        canActivate: [AdminAuthGuardService]
      },
      {
        path: 'productmaint',
        component: GA_ProductMaintPage,
        canActivate: [AdminAuthGuardService]
      },
      {
        path: 'adminusermaint',
        canActivate: [AdminAuthGuardService],
        component: AdminuserMaintComponent
      },
      {
        path: 'servicehost',
        canActivate: [AdminAuthGuardService],
        component: ServiceHostComponent
      },
      {
        path: '',
        redirectTo: '/dashboard'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

export const routing = RouterModule.forChild(routes);


