import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, OnInit, ViewEncapsulation, ErrorHandler, Injectable} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

// @Injectable()
// export class ErrorPage implements  ErrorHandler {

// }
@Component({
    selector: 'error-page',
    templateUrl: './error-page.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./error-page.scss']
  })

  @Injectable()
  export class ErrorPageComponent implements OnInit {
    protected readonly CLASSNAME = 'ErrorPage';
    public message: string;
    public message1: string;
    public notification: any;
    public currentUrl: string;
    public previousUrl: string;

    constructor(private _router: Router) {
      this.message = 'Error occured!';
    }

    ngOnInit() {
      this.message = 'Something went wrong, please try again.';
      this.message1 = 'If the issue persists, contact JHA support';
      this.notification = 'Generic Error!';
    }

    public getErrorMessage(): any {
      return this.message;
    }
    public setErrormessage( message: string) {
      this.message = message;
    }

    public getTitleMessage(): any {
      return this.notification;
    }
    public setTitlemessage( notification: string) {
      this.notification = notification;
    }

    public getRouterInfo() {
      this.message =  this._router.url;


      this.currentUrl = this._router.url;

      this._router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {        
          this.previousUrl = this.currentUrl;
          this.currentUrl = event.url;

        }

      });

      // console.log('Previous Route::: ' + this.previousUrl);
      // console.log('Current Route::: ' + this.currentUrl);
    }

    public onOkClick(env) {
      if(this.previousUrl && this.previousUrl.length>0) {
        this._router.navigate([this.previousUrl]);
      }
      else {
        this._router.navigate(['/login']);
      }
    }
  }

