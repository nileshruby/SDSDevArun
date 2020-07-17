import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

// Example call from view ( html tag)
// (keypress)="validateEntry($event)"
@Injectable()
export class SingletonService {
  protected readonly CLASSNAME = "SingletonService";
  private expirationSubscribe: BehaviorSubject<boolean>;
  public $expirationObservable: Observable<boolean>;

  constructor() {
    this.expirationSubscribe = new BehaviorSubject<boolean>(false);
    this.$expirationObservable = this.expirationSubscribe.asObservable();
  }
  setObservable(exp: boolean) {
    this.expirationSubscribe.next(exp);
  }
}
