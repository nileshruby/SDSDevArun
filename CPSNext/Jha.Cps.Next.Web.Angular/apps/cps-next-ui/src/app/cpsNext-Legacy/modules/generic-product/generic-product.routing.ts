import {Routes, RouterModule} from '@angular/router';
import {CM_WrapperComponent} from './wrapper.comp';
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
  ProcessViewErrorPage
} from './pages';

const routes: Routes = [
  {
    path: '',
    component: CM_WrapperComponent,
    
    children: [ 
      {
        path: '',
        component: InfoPage
      },
      {
        path: 'information',
        component: InfoPage
      },
      {
        path: 'fionboarding',
        component: FiOnboardingPage
      },
      {
        path: 'config-parameters',
        component: ConfigParametersPage
      },
      {
        path: 'prod-usr-admin',
        component: ProductUserAdministrationPage
      },
      {
        path: 'mastercard-fee-rate-main',
        component: MastercardFeeRateMaintenancePage
      },
      {
        path: 'ica-main',
        component: ICAMaintenancePage
      },
      {
        path: 'rtp-trans-activity',
        component: RTP_TransactionActivityPage
      },
      {
        path: 'service-instance',
        component: ServiceInstanceComponent
      },
      {
        path: 'statusreport',
        component: StatusReportPage
      },
      {
        path: 'svc-activity',
        component: ServiceActivityPage
      },
      {
        path: 'trans-activity',
        component: TransactionActivityPage
      },
      {
        path: 'process-view-error',
        component: ProcessViewErrorPage
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

export const routing = RouterModule.forChild(routes);
