import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Layer } from 'src/app/core/models/pos-window.model';

@Injectable({
  providedIn: 'root'
})
export class FromLayerBroadcastService {

  constructor() { }

  updateLayer = new Subject<Layer>();

  emitUpdateLayerEvent(layer: Layer): void {
    this.updateLayer.next(layer);
  }
  listenUpdateLayerEvent(): Observable<Layer> {
    return this.updateLayer.asObservable();
  }

}
