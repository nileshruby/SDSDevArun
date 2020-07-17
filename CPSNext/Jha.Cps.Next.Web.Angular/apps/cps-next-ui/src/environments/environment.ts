// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  isDebugMode: true,

  imagesDirPath: "/assets/",

  login: {
    username: '',
    password: ''
  },

  agGrid: {
    license: 'Evaluation_License_Valid_Until__17_November_2018__MTU0MjQxMjgwMDAwMA==e6e57614394e82591f7af9baff0981a4'
  },

  api: {
    url: '/api/'//,
    //serverUrl: 'http://localhost/Cps.Next.Service/jha/cps/api/next/'
  },

  logging: {
    minConsoleLogLevel: 0,
    minServerLogLevel: 3
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
