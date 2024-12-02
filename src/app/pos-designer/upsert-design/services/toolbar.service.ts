import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Layer, PosScreen } from 'src/app/core/models/pos-window.model';
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {

  constructor() { }

  /**
   * 
   * @param layerType 
   * Create a navigation link with default entries
   * @returns 
   */
   navigationLink(layerType: string): Observable<Layer>{
    return of({
      id: uuid.v4(),
      type: layerType, 
      name: 'Navigation',
      content: 'Text Here', 
      source: '',
      screen: '',
      menuItem: '',
      featureMethod: '',
      position:{top: 50, left: 50}, 
      dimension:{width: 10, height: 10}, 
      border: {'border-width': 1, 'border-style': 'solid', 'border-color':'#000000', 'border-radius':0}, 
      padding: {'padding-top': 0, 'padding-bottom': 0, 'padding-left': 0, 'padding-right': 0}, 
      margin: {'margin-top': 0, 'margin-bottom': 0, 'margin-left': 0, 'margin-right': 0}, 
      background: {'background-color': '#0d6efd', 'background-image': '', 'background-position': '', 'background-size': '', 'background-repeat': ''}, 
      text: {'text-align': 'left','font-size': 1, 'font-family': 'Roboto', 'font-weight': 'bold', color: '#ffffff'}, 
      googleFontLink: [],
      customStyle: [],
      isActive: true, 
      style: {}
    });
  }

  /**
   * 
   * @param layerType 
   * Create a button with default entries
   * @returns 
   */
  regularButton(layerType: string): Observable<Layer>{
    return of({
      id: uuid.v4(),
      type: layerType, 
      name: 'Button',
      content: 'Text Here', 
      source: '', 
      screen: '',
      menuItem: '',
      featureMethod: '',
      position:{top: 55, left: 55}, 
      dimension:{width: 14, height: 10}, 
      border: {'border-width': 1, 'border-style': 'solid', 'border-color':'#000000', 'border-radius':0}, 
      padding: {'padding-top': 0, 'padding-bottom': 0, 'padding-left': 0, 'padding-right': 0}, 
      margin: {'margin-top': 0, 'margin-bottom': 0, 'margin-left': 0, 'margin-right': 0}, 
      background: {'background-color': '#0dcaf0', 'background-image': '', 'background-position': '', 'background-size': '', 'background-repeat': ''}, 
      text: {'text-align': 'left','font-size': 1, 'font-family': 'Roboto', 'font-weight': 'bold', color: '#ffffff'}, 
      googleFontLink: [],
      customStyle: [],
      isActive: true, 
      style: {}
    });
  }

  /**
   * 
   * @param layerType 
   * Create a button to open dialog box with default entries
   * @returns 
   */
  dialogBoxButton(layerType: string): Observable<Layer>{
    return of({
      id: uuid.v4(),
      type: layerType, 
      name: 'Open Dialog',
      content: 'Text Here',  
      source: '',
      screen: '',
      menuItem: '',
      featureMethod: '',
      position:{top: 50, left: 45}, 
      dimension:{width: 7, height: 14}, 
      border: {'border-width': 1, 'border-style': 'solid', 'border-color':'#000000', 'border-radius':0}, 
      padding: {'padding-top': 0, 'padding-bottom': 0, 'padding-left': 0, 'padding-right': 0}, 
      margin: {'margin-top': 0, 'margin-bottom': 0, 'margin-left': 0, 'margin-right': 0}, 
      background: {'background-color': '#198754', 'background-image': '', 'background-position': '', 'background-size': '', 'background-repeat': ''}, 
      text: {'text-align': 'left','font-size': 1, 'font-family': 'Roboto', 'font-weight': 'bold', color: '#ffffff'}, 
      googleFontLink: [],
      customStyle: [],
      isActive: true, 
      style: {}
    });
  }

  /**
   * 
   * @param layerType 
   * Create an invoice widget with default entries
   * @returns 
   */
  invoiceWidget(layerType: string): Observable<Layer>{
    return of({
      id: uuid.v4(),
      type: layerType, 
      name: 'Invoice widget',
      content: 'Text Here',  
      source: '',
      screen: '',
      menuItem: '',
      featureMethod: '',
      position:{top: 0, left: 60}, 
      dimension:{width: 35, height: 60}, 
      border: {'border-width': 1, 'border-style': 'solid', 'border-color':'#6610f2', 'border-radius':0}, 
      padding: {'padding-top': 0, 'padding-bottom': 0, 'padding-left': 0, 'padding-right': 0}, 
      margin: {'margin-top': 0, 'margin-bottom': 0, 'margin-left': 0, 'margin-right': 0}, 
      background: {'background-color': '#ffffff', 'background-image': '', 'background-position': '', 'background-size': '', 'background-repeat': ''}, 
      text: {'text-align': 'left','font-size': 1, 'font-family': 'Roboto', 'font-weight': 'bold', color: '#000000'}, 
      googleFontLink: [],
      customStyle: [],
      isActive: true, 
      style: {}
    });
  }

  /**
   * 
   * @param layerType 
   * Create a status widget with default entries
   * @returns 
   */
  statusWidget(layerType: string): Observable<Layer>{
    return of({
      id: uuid.v4(),
      type: layerType, 
      name: 'Status Widget',
      content: 'Text Here',  
      source: '',
      screen: '',
      menuItem: '',
      featureMethod: '',
      position:{top: 95, left: 5}, 
      dimension:{width: 90, height: 5}, 
      border: {'border-width': 1, 'border-style': 'solid', 'border-color':'#000000', 'border-radius':0}, 
      padding: {'padding-top': 0, 'padding-bottom': 0, 'padding-left': 0, 'padding-right': 0}, 
      margin: {'margin-top': 0, 'margin-bottom': 0, 'margin-left': 0, 'margin-right': 0}, 
      background: {'background-color': '#ffc107', 'background-image': '', 'background-position': '', 'background-size': '', 'background-repeat': ''}, 
      text: {'text-align': 'left','font-size': 1, 'font-family': 'Roboto', 'font-weight': 'bold', color: '#ffffff'}, 
      googleFontLink: [],
      customStyle: [],
      isActive: true, 
      style: {}
    });
  }

  /**
   * 
   * @param layerType 
   * Create a image with default entries
   * @returns 
   */
  imageBlock(layerType: string): Observable<Layer>{
    return of({
      id: uuid.v4(),
      type: layerType, 
      name: 'Image box',
      content: 'Select an Image', 
      source: '',
      screen: '',
      menuItem: '',
      featureMethod: '',
      position:{top: 35, left: 35}, 
      dimension:{width: 30, height: 30}, 
      border: {'border-width': 1, 'border-style': 'solid', 'border-color':'#d5d5d5', 'border-radius':0}, 
      padding: {'padding-top': 0, 'padding-bottom': 0, 'padding-left': 0, 'padding-right': 0}, 
      margin: {'margin-top': 0, 'margin-bottom': 0, 'margin-left': 0, 'margin-right': 0}, 
      background: {'background-color': '#d5d5d5', 'background-image': '', 'background-position': '', 'background-size': '', 'background-repeat': ''}, 
      text: {'text-align': 'left','font-size': 1, 'font-family': 'Roboto', 'font-weight': 'bold', color: '#ffffff'},
      googleFontLink: [],
      customStyle: [],
      isActive: true, 
      style: {}
    });
  }

  /**
   * 
   * @param layerType 
   * Create a image with default entries
   * @returns 
   */
  videoBlock(layerType: string): Observable<Layer>{
    return of({
      id: uuid.v4(),
      type: layerType, 
      name: 'Video Block',
      content: 'Select a Video',  
      source: '',
      screen: '',
      menuItem: '',
      featureMethod: '',
      position:{top: 35, left: 35}, 
      dimension:{width: 20, height: 20}, 
      border: {'border-width': 1, 'border-style': 'solid', 'border-color':'#e8e8e8', 'border-radius':0}, 
      padding: {'padding-top': 0, 'padding-bottom': 0, 'padding-left': 0, 'padding-right': 0}, 
      margin: {'margin-top': 0, 'margin-bottom': 0, 'margin-left': 0, 'margin-right': 0}, 
      background: {'background-color': '#e8e8e8', 'background-image': '', 'background-position': '', 'background-size': '', 'background-repeat': ''}, 
      text: {'text-align': 'left','font-size': 1, 'font-family': 'Roboto', 'font-weight': 'bold', color: '#cccccc'}, 
      googleFontLink: [],
      customStyle: [],
      isActive: true, 
      style: {}
    });
  }

  /**
   * 
   * @param layerType 
   * Create a textbox with default entries
   * @returns 
   */
  textbox(layerType: string): Observable<Layer>{
    return of({
      id: uuid.v4(),
      type: layerType, 
      name: 'Text box',
      content: 'Inline Text Here',  
      source: '',
      screen: '',
      menuItem: '',
      featureMethod: '',
      position:{top: 45, left: 50}, 
      dimension:{width: 30, height: 5}, 
      border: {'border-width': 1, 'border-style': 'solid', 'border-color':'#000000', 'border-radius':0}, 
      padding: {'padding-top': 0, 'padding-bottom': 0, 'padding-left': 0, 'padding-right': 0}, 
      margin: {'margin-top': 0, 'margin-bottom': 0, 'margin-left': 0, 'margin-right': 0}, 
      background: {'background-color': '#ffffff', 'background-image': '', 'background-position': '', 'background-size': '', 'background-repeat': ''}, 
      text: {'text-align': 'left','font-size': 1, 'font-family': 'Roboto', 'font-weight': 'bold', color: '#6c757d'}, 
      googleFontLink: [],
      customStyle: [],
      isActive: true, 
      style: {}
    });
  }

  /**
   * Create a screen with default entries
   * @returns 
   */
  screenDefault(): Observable<PosScreen>{
    return of({
      id: uuid.v4(),
      name: 'Untitled Screen',
      background: {'background-color': '#ffffff', 'background-image': '', 'background-position': '', 'background-size': '', 'background-repeat': ''}, 
      layers: [],
      customStyle: [],
      style: {}
    });
  }


}
