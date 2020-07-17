import { Injectable } from "@angular/core";
import { Observable, Subject, timer, Subscription } from "rxjs";
import { filter, map } from "rxjs/operators";
import { VaultService } from "@services/vault.svc";

import { IEventQueueItem } from "@app/entities/event-queue-item.i";
import { CONSTANTS } from "@app/entities/constants";
import "./../shared/date-extensions";

@Injectable()
export class SessionService {
  protected readonly CLASSNAME = "SessionService";

  private _subscriptions: Subject<IEventQueueItem>;

  public SESSION_WARNING$: Subject<Date>;
  session_warning_subscription: Subscription;
  session_warning_timer_subscription: Subscription;
  SESSION_WARNING_TIMER$: Observable<number>;

  public SESSION_EXPIRATION$: Subject<Date>;
  session_expiration_subscription: Subscription;
  session_expiration_timer_subscription: Subscription;
  SESSION_EXPIRATION_TIMER$: Observable<number>;

  warning: Date;
  expiration = new Date(0);

  constructor(private vaultSvc: VaultService) {
    this.SESSION_WARNING$ = new Subject<Date>();
    this.SESSION_EXPIRATION$ = new Subject<Date>();

    this._subscriptions = new Subject<IEventQueueItem>();
  }

  setExpiration(expiration: Date, url: string) {
    // new Object(); //console.log(`+${this.CLASSNAME}.setExpiration`);

    //server side: this shouldn't be happening!!!
    let msExp = expiration.getTime();
    let msThisExp = this.expiration.getTime();
    let msNew = new Date().getTime();
    if (msExp < msThisExp || msExp < msNew) {
      //this isn't working. why?
      // new Object(); //console.log(`\t**** ${url}: sent an old expiration time!!! ****`);
      return;
    }

    this.expiration = new Date(
      expiration.getTime() - CONSTANTS.SESSION_TIMER.ONE_MINUTE
    );
    //Debug code
    // this.expiration = new Date(
    //   expiration.getTime() - CONSTANTS.SESSION_TIMER.DEBUG_EXPIRATION_OFFSET
    // );

    this.warning = new Date(
      this.expiration.getTime() - CONSTANTS.SESSION_TIMER.SHOW_WARNING_TIMER
    );
    this.log();

    if (this.session_warning_subscription) {
      this.session_warning_subscription.unsubscribe();
      this.session_warning_subscription = null;
    }

    this.SESSION_WARNING_TIMER$ = timer(this.warning);
    this.session_warning_subscription = this.SESSION_WARNING_TIMER$.subscribe(
      () => {
        this.session_warning_subscription.unsubscribe();
        this.session_warning_subscription = null;
        // new Object(); //console.log(this.CLASSNAME + ": " + "this.onWarningTimer();");
        this.onWarningTimer();
      }
    );

    if (this.session_expiration_subscription) {
      this.session_expiration_subscription.unsubscribe();
      this.session_expiration_subscription = null;
    }
    this.SESSION_EXPIRATION_TIMER$ = timer(this.expiration);
    this.session_expiration_subscription = this.SESSION_EXPIRATION_TIMER$.subscribe(
      () => {
        this.session_expiration_subscription.unsubscribe();
        this.session_expiration_subscription = null;
        // new Object(); //console.log(this.CLASSNAME + ": " + "this.onExpirationTimer();");
        this.onExpirationTimer();
      }
    );
    // new Object(); //console.log(`-${this.CLASSNAME}.setExpiration`);
  }

  private onWarningTimer() {
    // new Object(); //console.log(`+${this.CLASSNAME}.onWarningTimer`);
    // console.log(
    //   `${this.CLASSNAME}:this.SESSION_WARNING$.observers.length = ${this.SESSION_WARNING$.observers.length}`
    // );
    this.log();
    this.SESSION_WARNING$.next(this.expiration);
    // new Object(); //console.log(`-${this.CLASSNAME}.onWarningTimer`);
  }

  private onExpirationTimer() {
    // new Object(); //console.log(`+${this.CLASSNAME}.onExpirationTimer`);
    this.log();
    // console.log(
    //   `\tthis.SESSION_EXPIRATION$.observers.length = ${this.SESSION_EXPIRATION$.observers.length}`
    // );
    this.SESSION_EXPIRATION$.next(this.expiration);
    // new Object(); //console.log(`-${this.CLASSNAME}.onExpirationTimer`);
  }

  //#region Properties
  public get(key: string) {
    return this.vaultSvc.get(key);
  }

  public set(key: string, data: any) {
    this.vaultSvc.set(key, data);
    this._subscriptions.next({ key, data });
  }

  public remove(...keys: Array<string>) {
    this.vaultSvc.remove(...keys);
  }
  //#endregion Properties

  public clearAll() {
    this.vaultSvc.clearAll();
  }

  public clearSession() {
    this.clearAll();
  }

  onUpdate<T>(key: any): Observable<T> {
    var result = this._subscriptions.asObservable().pipe(
      filter(event => event.key === key),
      map(event => <T>event.data)
    );
    return result;
  }

  log() {
    return;
    const now = new Date();
    console.log(
      `\tnow: ${now.toShortTimeString()},\n\twrn: ${this.warning.toShortTimeString()},\n\texp: ${this.expiration.toShortTimeString()}`
    );
  }
}
