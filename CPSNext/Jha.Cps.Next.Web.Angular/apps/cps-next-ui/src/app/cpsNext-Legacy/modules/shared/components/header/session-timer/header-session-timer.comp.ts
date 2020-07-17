import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  ViewChildren,
  TemplateRef,
  QueryList,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import { Router } from "@angular/router";
import { AccountService, DialogService, SessionService } from "@app/services";
import { DialogConfig, DialogTypes } from "@entities/dialog";
import { APP_KEYS } from "@entities/app-keys";
import { CONSTANTS } from "@entities/constants";

import * as _ from "lodash";
import { Subscription, Observable, timer } from "rxjs";
import { TimeSpan } from "@app/shared/time-span";
import "./../../../../../shared/date-extensions";

@Component({
  selector: "session-timer",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./header-session-timer.comp.scss"],
  templateUrl: "./header-session-timer.comp.html"
})
export class HeaderSessionTimerComponent implements OnInit, OnDestroy {
  protected readonly CLASSNAME = "HeaderSessionTimerComponent";

  private readonly SHOW_TIMER = CONSTANTS.SESSION_TIMER.SHOW_WARNING_TIMER;
  private readonly SHOW_DIALOG = CONSTANTS.SESSION_TIMER.SHOW_WARNING_DIALOG;

  public _expiration: Date;
  public set expiration(value: Date) {
    // console.log(
    //   `+${this.CLASSNAME}: set expiration=(${value.toShortTimeString()})`
    // );
    this._expiration = value;
  }
  public get expiration(): Date {
    return this._expiration;
  }

  public remainingMinutes: string;
  public remainingSeconds: string;
  public isTimerVisible = false;
  private isDialogVisible = false;

  SESSION_WARNING$: Observable<Date>;
  session_warninng_subscription: Subscription;
  SESSION_EXPIRATION$: Observable<Date>;
  session_expiration_subscription: Subscription;

  countdown_timer_subscription: Subscription;
  COUNTDOWN_TIMER$: Observable<number>;
  static INSTANCE_COUNT = 0;
  INSTANCE_ID: number;

  constructor(
    private _router: Router,
    private _accountSvc: AccountService,
    private _sessionSvc: SessionService,
    private _dialogSvc: DialogService
  ) {
    this.INSTANCE_ID = ++this.INSTANCE_COUNT;
    // console.log(
    //   `HeaderSessionTimerComponent.INSTANCE_COUNT: ${this.INSTANCE_COUNT}`
    // );
  }

  public get INSTANCE_COUNT(): number {
    return HeaderSessionTimerComponent.INSTANCE_COUNT;
  }
  public set INSTANCE_COUNT(value: number) {
    HeaderSessionTimerComponent.INSTANCE_COUNT = value;
  }

  _isHidden: any;
  public get isHidden() {
    return this._isHidden;
  }
  public set isHidden(value: any) {
    this._isHidden = value;
  }

  ngOnInit() {
    this.SESSION_WARNING$ = this._sessionSvc.SESSION_WARNING$;
    this.SESSION_EXPIRATION$ = this._sessionSvc.SESSION_EXPIRATION$;

    this.subscribe(true);
  }

  ngOnDestroy() {
    this.subscribe(false);
    --this.INSTANCE_COUNT;
    // console.log(
    //   `HeaderSessionTimerComponent.INSTANCE_COUNT: ${this.INSTANCE_COUNT}`
    // );
  }

  private subscribe(subscribe: boolean) {
    // console.log(`+${this.CLASSNAME}: subscribe(${subscribe})`);
    if (subscribe) {
      this.session_warninng_subscription = this.SESSION_WARNING$.subscribe(
        (date: Date) => {
          this.onSessionWarning(date);
        }
      );
      this.session_expiration_subscription = this.SESSION_EXPIRATION$.subscribe(
        (date: Date) => {
          this.onSessionExpiration();
        }
      );
    } else {
      if (this.session_warninng_subscription)
        this.session_warninng_subscription.unsubscribe();
      if (this.session_expiration_subscription)
        this.session_expiration_subscription.unsubscribe();
      if (this.countdown_timer_subscription)
        this.countdown_timer_subscription.unsubscribe();
    }
    // console.log(`-${this.CLASSNAME}: subscribe(${subscribe})`);
  }

  private onSessionExpiration() {
    // console.log(`+${this.CLASSNAME}.onSessionExpiration`);
    // console.log(
    //   `\tnow:${new Date().toShortTimeString()}, expiration:${
    //     this.expiration ? this.expiration.toShortTimeString() : this.expiration
    //   }`
    // );
    this.logoff();
    // console.log(`-${this.CLASSNAME}: onSessionExpiration`);
  }

  private onSessionWarning(expiration: Date) {
    // console.log(`+${this.CLASSNAME}.onSessionWarning`);
    // console.log(
    //   `\tnow:${new Date().toShortTimeString()}, expiration:${expiration.toShortTimeString()}`
    // );

    this.expiration = expiration;
    this.startCountdown();
    // console.log(`-${this.CLASSNAME}.onSessionWarning`);
  }

  startCountdown() {
    // console.log(`+${this.CLASSNAME}.startCountdown`);
    this.stopCountdown();
    this.isTimerVisible = true;
    let now = new Date();

    this.COUNTDOWN_TIMER$ = timer(1000, 1000); //fire every second.
    this.countdown_timer_subscription = this.COUNTDOWN_TIMER$.subscribe(() => {
      this.onCountdownTimer();
    });
    // console.log(`-${this.CLASSNAME}.startCountdown`);
  }

  stopCountdown() {
    // console.log(`+${this.CLASSNAME}.stopCountdown`);
    // console.log(
    //   `\tnow:${new Date().toShortTimeString()}, expiration:${this.expiration.toShortTimeString()}`
    // );
    if (this.countdown_timer_subscription) {
      this.countdown_timer_subscription.unsubscribe();
      this.countdown_timer_subscription = null;
    }
    // console.log(`-${this.CLASSNAME}.stopCountdown`);
  }

  onCountdownTimer() {
    // console.log(
    //   `+${this.CLASSNAME}.onCountdownTimer: ${new Date().toShortTimeString()}`
    // );

    const now = new Date();
    const ts = TimeSpan.subtract(this.expiration, now);

    this.remainingMinutes = ts.minutes.toString();
    this.remainingSeconds = ts.seconds.toString().padStart(2, "0");

    const remaining = ts.getTotalMilliseconds();
    if (!this.isDialogVisible && remaining < this.SHOW_DIALOG) {
      this.showDialog(true);
    } else {
      new Object();
    }
    // console.log(`-${this.CLASSNAME}.onCountdownTimer`);
  }

  showDialog(show: boolean) {
    if (show) {
      let cfg = _.merge(new DialogConfig(), {
        dialogType: DialogTypes.YesNo,
        title: "Session Timeout",
        text: CONSTANTS.genericCRUDMsgs.sessionTimingOut,
        okButtonCallback: this.extendSession,
        cancelButtonCallback: this.logoff
      });
      this._dialogSvc.show(cfg);
      this.isDialogVisible = true;
    } else {
      if (this.isDialogVisible) {
        this._dialogSvc.hide();
        this.isDialogVisible = false;
      }
    }
  }

  public onExtendClick() {
    this.extendSession();
  }

  private extendSession = () => {
    // console.log(`+${this.CLASSNAME}.extendSession`);
    // console.log(
    //   `\tnow:${new Date().toShortTimeString()}, expiration:${this.expiration.toShortTimeString()}`
    // );
    this.stopCountdown();
    this.showDialog(false);
    this.isTimerVisible = false;
    const userDetails = this._sessionSvc.get(APP_KEYS.userContext);
    this._accountSvc
      .isUserExists(userDetails.username)
      .toPromise()
      .then(response => {
        new Object();
      });
    // console.log(`-${this.CLASSNAME}.extendSession`);
  };

  private logoff = () => {
    this._dialogSvc.hide();
    this.isDialogVisible = false;

    // TEMP - Remove when session timeout is fixed
    if (this._router.url && this._router.url.indexOf("login") >= 0) {
      return;
    }
    this._sessionSvc.clearSession();
    window.location.reload();
  };
}
