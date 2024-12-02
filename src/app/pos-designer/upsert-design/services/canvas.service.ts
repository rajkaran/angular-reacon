import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Layer, PosScreen } from 'src/app/core/models/pos-window.model';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  constructor() { }

  /**
   * 
   * @param layer 
   * Build string from style set for a layer that can simply be supplied to view to render a layer.
   * NOTE: If field is empty then value would be null
   */
  buildStyleForLayer(layer: Layer, measurementUnits: {[key: string]: string}, serverUrl: string, organizationId: string): Observable<{[key: string]: string}>{
    let result: {[key: string]: string} = {
      position: 'absolute' 
    }

    if(layer.position.top) result['top'] = layer.position.top.toString()+measurementUnits['coordinate'];
    if(layer.position.left) result['left'] = layer.position.left.toString()+measurementUnits['coordinate'];
    if(layer.dimension.width) result['width'] = layer.dimension.width.toString()+measurementUnits['dimension'];
    if(layer.dimension.height) result['height'] = layer.dimension.height.toString()+measurementUnits['dimension'];

    // set background
    for (const property in layer.background) {
      if(layer.background[property]){
        result[property] = layer.background[property].toString();

        if(property === 'background-image' && layer.background[property] != ''){
          result[property] = `url(${serverUrl}/file-downloads/${organizationId}/${layer.background[property]})`;
        }
      }  
    }

    // set border
    for (const property in layer.border) {
      if(layer.border[property]){
        result[property] = layer.border[property].toString();
      
        if(property === 'border-width' || property === 'border-radius'){
          result[property] += measurementUnits['border'];
        }
      }
    }

    // set padding
    for (const property in layer.padding) {
      if(layer.padding[property]){
        result[property] = layer.padding[property].toString()+measurementUnits['padding'];
      }
    }

    // set margin
    for (const property in layer.margin) {
      if(layer.margin[property]){
        result[property] = layer.margin[property].toString()+measurementUnits['margin'];
      }
    }

    // set customStyle
    for (let j = 0, len = layer.customStyle.length; j < len; j++) {
      if(layer.customStyle[j].value){
        let property = layer.customStyle[j].property;
        result[property] = layer.customStyle[j].value;
      }
    }

    // set text
    for (const property in layer.text) {
      if(layer.text[property]){
        result[property] = layer.text[property].toString();
        
        if(property === 'font-size') result[property] += measurementUnits['font'];
      }      
    }

    return of(result);
  }

  /**
   * 
   * @param layer 
   * Build string from style set for a screen that can simply be supplied to view to render a screen.
   */
  buildStyleForScreen(screen: PosScreen, measurementUnits: {[key: string]: string}, serverUrl: string, organizationId: string): Observable<{[key: string]: string}>{
    let result: {[key: string]: string} = { }

    // set background
    for (const property in screen.background) {
      result[property] = screen.background[property].toString();

      if(property === 'background-image' && screen.background[property] != ''){
        result[property] = `url(${serverUrl}/file-downloads/${organizationId}/${screen.background[property]})`;
      }
    }

    // set customStyle
    for (let j = 0, len = screen.customStyle.length; j < len; j++) {
      let property = screen.customStyle[j].property;
      result[property] = screen.customStyle[j].value;
    }

    return of(result);
  }


}
