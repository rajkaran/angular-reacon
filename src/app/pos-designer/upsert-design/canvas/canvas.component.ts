import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SafeHtml } from '@angular/platform-browser';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, delay, map } from 'rxjs/operators';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { Layer, PosScreen, PosWindow, SelectedLayer, SelectedScreen } from 'src/app/core/models/pos-window.model';
import { environment } from 'src/environments/environment';
import { SubSink } from 'subsink';
import { FromLayerBroadcastService } from '../broadcasts/from-layer-broadcast.service';
import { FromScreenBroadcastService } from '../broadcasts/from-screen-broadcast.service';
import { FromToolbarBroadcastService } from '../broadcasts/from-toolbar-broadcast.service';
import { CanvasService } from '../services/canvas.service';
import { UtilDesignService } from '../services/util-design.service';

@Component({
  selector: 'wx-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @ViewChild('designContainer', {static: true}) designContainer: ElementRef;
  @ViewChild('canvas', {static: true}) canvas: ElementRef;
  @ViewChild('highlighter', {static: true}) highlighter: ElementRef;

  @Input() organizationId: string;
  @Input() posWindow: PosWindow;  
  @Input() dropdownOptions: {[key: string]: DropdownOption[]};

  posWindowLocal: PosWindow;
  screenDetail: PosScreen;

  canvasDimension: string = 'width: 1024px; height: 576px;';
  designDimension: string = 'width: 1024px; height: 576px;';
  fontFamilyImport: SafeHtml = '';
  htmlContent: SafeHtml = '';
  measurementUnits: {[key: string]: string} = {};
  selectedLayer: {id: string, index: number} = {id: '', index: -1};
  selectedScreen: {id: string, index: number} = {id: '', index: -1};
  serverUrl = environment.api_url;
  styleSheetImport: SafeHtml = '';
  subsinks: SubSink = new SubSink();

  highlightCoordinate: {[key: string]: string|number} = {top:0, left:0}

  constructor(
    public snackBar: MatSnackBar,
    private utilDesignService: UtilDesignService,
    private fromToolbarBroadcast: FromToolbarBroadcastService,
    private fromLayerBroadcast: FromLayerBroadcastService,
    private fromScreenBroadcast: FromScreenBroadcastService,
    private canvasService: CanvasService,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.tapBroadcastedEvents();
  }

  /**
   * 
   * @param changes 
   * Keep updating local variables when @Input variables has been changed.
   * 
   * Note: organizationId won't change while working on design so, we don't need if condition for it.
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {

      if(propName === 'dropdownOptions'){
        for(let i = 0, len = changes[propName].currentValue.measurementUnit.length; i < len; i++){
          this.measurementUnits[this.dropdownOptions.measurementUnit[i].key] = this.dropdownOptions.measurementUnit[i].displayText
        }
      }

      if(propName === 'posWindow'){
        if(changes[propName].currentValue){
          console.log('everytime posWindow object chnages ', this.posWindow)
          this.posWindowLocal = this.posWindow;

          // select first screen to render on load. listening event causes race condition.
          this.selectedScreen = {id: this.posWindowLocal.screens[0].id, index: 0};
          
          this.setDimensionAndScale();
          this.updateScreenDisplay();
        }
      }
        
    }
  }

  // tap broadcasted events through out the designer
  tapBroadcastedEvents(){
    // update canvas dimensions as being edited in settings
    this.subsinks.sink = this.fromToolbarBroadcast.listenUpdateDimensionEvent()
    .subscribe( (flag: boolean) => {
      this.setDimensionAndScale();
    });

    // As user selects a screen from the list we would render that screen in view.
    this.subsinks.sink = this.fromToolbarBroadcast.listenSelectedScreenEvent()
    .subscribe( (selectedScreen: SelectedScreen) => {
      this.selectedScreen = selectedScreen;
      this.updateScreenDisplay();
    });

    // update a screen view as screen style changes
    this.subsinks.sink = this.fromScreenBroadcast.listenUpdateScreenEvent()
    .pipe(
      concatMap( (posScreen: PosScreen) => {
        return this.canvasService.buildStyleForScreen(posScreen, this.measurementUnits, this.serverUrl, this.organizationId);
      })
    )
    .subscribe( (style: {[key: string]: string}) => {
      this.posWindowLocal.screens[this.selectedScreen.index].style = style;
    });

    // As user selects a layer from the list we would need to highlight that layer in view.
    this.subsinks.sink = this.fromToolbarBroadcast.listenSelectedLayerEvent()
    .subscribe( (selectedLayer: SelectedLayer) => {
      this.selectedLayer = selectedLayer;
    });

    // update a layer view as layer style changes
    this.subsinks.sink = this.fromLayerBroadcast.listenUpdateLayerEvent()
    .pipe(
      concatMap( (layer: Layer) => {
        return this.canvasService.buildStyleForLayer(layer, this.measurementUnits, this.serverUrl, this.organizationId);
      })
    )
    .subscribe( (style: {[key: string]: string}) => {
      this.posWindowLocal.screens[this.selectedScreen.index].layers[this.selectedLayer.index].style = style;
    });

    // render layer view for a new layer
    this.subsinks.sink = this.fromToolbarBroadcast.listenAddLayerEvent()
    .pipe(
      concatMap( (index: number) => {
        const layer: Layer = this.posWindowLocal.screens[this.selectedScreen.index].layers[index];
        return forkJoin([ 
          of(index), 
          this.canvasService.buildStyleForLayer(layer, this.measurementUnits, this.serverUrl, this.organizationId) 
        ]) ;
      })
    )
    .subscribe( ([index, style]) => {
      this.posWindowLocal.screens[this.selectedScreen.index].layers[index].style = style;
    });

  }

  // Scale down or up design dimensions to fit in given canvas size.
  setDimensionAndScale(){
    if(this.posWindowLocal.canvasWidth != undefined && this.posWindowLocal.canvasHeight != undefined){
      this.canvasDimension = `width: ${this.posWindowLocal.canvasWidth}px; height: ${this.posWindowLocal.canvasHeight}px;`;
    }

    if(this.posWindowLocal.designWidth != undefined && this.posWindowLocal.designHeight != undefined){
      this.designDimension = `width: ${this.posWindowLocal.designWidth}px; height: ${this.posWindowLocal.designHeight}px;`;
    }

    // scale down the design which is bigger than canvas.
    if(this.posWindowLocal.canvasWidth != undefined && this.posWindowLocal.designWidth != undefined && this.posWindowLocal.canvasWidth < this.posWindowLocal.designWidth){
      this.utilDesignService.resize(this.designContainer.nativeElement, (this.posWindowLocal.canvasWidth)/this.posWindowLocal.designWidth)
    }
  }

  // update canvas as updates being made to the screen object.
  updateScreenDisplay(){
    this.screenDetail = this.posWindowLocal.screens[this.selectedScreen.index];
    
    this.subsinks.sink = this.canvasService.buildStyleForScreen(this.screenDetail, this.measurementUnits, this.serverUrl, this.organizationId)
    .subscribe( (formedStyle: {[key: string]: string}) => {
      this.screenDetail.style = formedStyle;
    });

    this.screenDetail.layers = this.screenDetail.layers.filter( (layer: Layer) => layer.isActive);

    let styleObservableArray: Observable<{[key: string]: string}>[] = [];

    for(let i = 0, len = this.screenDetail.layers.length; i < len; i++){
      styleObservableArray[i] = this.canvasService
      .buildStyleForLayer(this.screenDetail.layers[i], this.measurementUnits, this.serverUrl, this.organizationId)
      .pipe(
        map( (formedStyle: {[key: string]: string}) => {
          this.screenDetail.layers[i].style = formedStyle;
          return formedStyle;
        })
      );
    }

    this.subsinks.sink = forkJoin(styleObservableArray)
    .subscribe( (formedStyles: {[key: string]: string}[]) => { });
  }

  // display messages in snackbar
  displayError(message: string, action: number){
    this.snackBar.openFromComponent(InteractMessageComponent, {
      data: {message: message, action: action},
      duration: 5000,
    });
  }

  // destroy subscriptions on component destroy
  ngOnDestroy(){
    this.subsinks.unsubscribe();
  }

}
