import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import { IEventQueueItem } from '@app/entities/event-queue-item.i';

@Injectable()
export class BroadcastService {
  protected readonly CLASSNAME = 'BroadcastService';

  private _eventBus: Subject<IEventQueueItem>;

  constructor() {
    this._eventBus = new Subject<IEventQueueItem>();
  }

  public broadcast(key: any, data?: any) {
    // $L.debug(`Broadcaster > broadcast > ${key}`, data);

    this._eventBus.next({key, data});
  }

  public on<T>(key: any): Observable<T> {
    // $L.debug(`Broadcaster > on > ${key}`);

    return this._eventBus.asObservable()
      .pipe(
        filter(event => event.key === key),
        map(event => <T>event.data)
      );
  }
}

