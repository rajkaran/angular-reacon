import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SelectedLayer, SelectedScreen } from 'src/app/core/models/pos-window.model';

@Injectable({
  providedIn: 'root'
})
export class FromToolbarBroadcastService {

  constructor() { }

  updateDimension = new Subject<boolean>();
  selectedLayer = new Subject<SelectedLayer>();
  addLayer = new Subject<number>();
  selectedScreen = new Subject<SelectedScreen>();

  emitUpdateDimensionEvent(flag: boolean): void {
    this.updateDimension.next(flag);
  }
  listenUpdateDimensionEvent(): Observable<boolean> {
    return this.updateDimension.asObservable();
  }

  emitSelectedLayerEvent(layerId: string, layerIndex: number): void {
    this.selectedLayer.next({id: layerId, index: layerIndex});
  }
  listenSelectedLayerEvent(): Observable<SelectedLayer> {
    return this.selectedLayer.asObservable();
  }

  emitAddLayerEvent(layerIndex: number): void {
    this.addLayer.next(layerIndex);
  }
  listenAddLayerEvent(): Observable<number> {
    return this.addLayer.asObservable();
  }

  emitSelectedScreenEvent(screenId: string, screenIndex: number): void {
    this.selectedScreen.next({id: screenId, index: screenIndex});
  }
  listenSelectedScreenEvent(): Observable<SelectedScreen> {
    return this.selectedScreen.asObservable();
  }


}
