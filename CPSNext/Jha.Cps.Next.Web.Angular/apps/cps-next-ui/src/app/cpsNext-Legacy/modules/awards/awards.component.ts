// import { AwardsService } from './../../services/awards.svc';
// import { Component, OnInit } from '@angular/core';
// import { FormGroup } from '@angular/forms';
// // import {AwardsService } from '@services;

// @Component({
//   selector: 'app-awards',
//   templateUrl: './awards.component.html',
//   styleUrls: ['./awards.component.css']
// })

// export class AwardsComponent implements OnInit {
//   SearchForm: FormGroup;
//   cols: any[]=[];
//   expandedRows: any[] = [];
//   errorList: any[] = [];

//   constructor( private awardService: AwardsService) { }

//   ngOnInit() {
//      const choices = this.awardService.getErrorTypes();
//      console.log('Choices: ' + JSON.stringify(choices));
//   }

//   getColumns(errorType: string) {

//     this.cols = [
//       { field: 'fiId', header: 'FI ID' },
//       { field: 'aba', header: 'ABA Number' },
//       { field: 'fiName', header: 'Name' },
//       { field: 'fiNameShort', header: 'Short Name' },
//       { field: 'mainframeId', header: 'Mainframe FIID' },
//       { field: 'isFdcMigrated', header: 'Migrated to FDC' },
//       { field: 'pscuClientId', header: 'PSCU Client ID' },
//       { field: 'address', header: 'Address' },
//       { field: 'city', header: 'City' },
//       { field: 'state', header: 'State' },
//       { field: 'zip', header: 'Zip' },
//       { field: 'zip4', header: 'Extended Zip' }
//     ];

//   }

// }
