import { Injectable } from '@angular/core';
import { Observable, Subject } from '@node_modules/rxjs';
import { filter, map } from '@node_modules/rxjs/operators';
import { IEventQueueItem } from '@app/entities/event-queue-item.i';

@Injectable()
export class VaultService {
  protected readonly CLASSNAME = 'VaultService';
  private _subscriptionBus: Subject<IEventQueueItem>;

  constructor() {
    this._subscriptionBus = new Subject<IEventQueueItem>();
  }

  public get(key: string) {
    let data = sessionStorage.getItem(key);

    if (data && (data[0] === '{' || data[0] === '['))
      return JSON.parse(data);

    return data;
  }

  public set(key: string, data: any) {
    if (data === null)
      sessionStorage.setItem(key, data);
    else if (typeof data === 'string')
      sessionStorage.setItem(key, data);
    else
      sessionStorage.setItem(key, JSON.stringify(data));

    this._subscriptionBus.next({ key, data });
  }

  public remove(...keys: Array<string>) {
    keys.forEach((key: string) => {
      sessionStorage.removeItem(key);

      this._subscriptionBus.next({ key });
    });
  }

  public clearAll() {
    sessionStorage.clear();
  }

  public onUpdate<T>(key: any): Observable<T> {
    return this._subscriptionBus.asObservable()
      .pipe(
        filter(event => event.key === key),
        map(event => <T>event.data)
      );
  }
}
