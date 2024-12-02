import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PosScreen } from 'src/app/core/models/pos-window.model';

@Injectable({
  providedIn: 'root'
})
export class FromScreenBroadcastService {

  constructor() { }

  updateScreen = new Subject<PosScreen>();

  emitUpdateScreenEvent(screen: PosScreen): void {
    this.updateScreen.next(screen);
  }
  listenUpdateScreenEvent(): Observable<PosScreen> {
    return this.updateScreen.asObservable();
  }


}
