import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';

import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { FileAndFolderMetadata } from 'src/app/core/models/file-and-folder-metadata.model';
import { Layer, PosScreen } from 'src/app/core/models/pos-window.model';
import { UtilAutocompleteService } from 'src/app/core/services/util-autocomplete.service';
import { FromLayerBroadcastService } from '../broadcasts/from-layer-broadcast.service';
import { FeatureMethod } from 'src/app/core/models/feature-method.model';
import { MenuItem } from 'src/app/core/models/menu.model';

@Component({
  selector: 'wx-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class LayerComponent implements OnInit {
  @Input() departments: string[];
  @Input() featureMethods: FeatureMethod[];
  @Input() fieldAvailability: {[key: string]: string[]};
  @Input() layer: Layer;
  @Input() measurementUnits: {[key: string]: string} = {};
  @Input() mediaList: FileAndFolderMetadata[];
  @Input() menuItems: MenuItem[]; 
  @Input() posScreens: PosScreen[] = [];

  bgImageSourceFormControl: FormControl = new FormControl(''); 
  departmentFormControl: FormControl = new FormControl('');  
  featureMethodFormControl: FormControl = new FormControl(''); 
  filteredDepartmentList: Observable<string[]>;
  filteredBackgroundImageMediaList: Observable<FileAndFolderMetadata[]>;
  filteredImageMediaList: Observable<FileAndFolderMetadata[]>;
  filteredVideoMediaList: Observable<FileAndFolderMetadata[]>;
  filteredPosScreenList: Observable<PosScreen[]>;
  filteredFeatureMethodList: Observable<FeatureMethod[]>;
  filteredMenuItemList: Observable<MenuItem[]>;
  imageSourceFormControl: FormControl = new FormControl('');
  menuItemFormControl: FormControl = new FormControl('');
  layerForm: FormGroup; 
  posScreenFormControl: FormControl = new FormControl(''); 
  subsinks: SubSink = new SubSink();
  videoSourceFormControl: FormControl = new FormControl('');

  constructor(
    public snackBar: MatSnackBar, private formBuilder: FormBuilder,
    private fromLayerBroadcast: FromLayerBroadcastService,
    private utilAutocompleteService: UtilAutocompleteService
  ) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {

      if(propName === 'layer'){
        if(changes[propName].firstChange || changes[propName].currentValue.id !== changes[propName].previousValue.id){
          this.initializeFilterOption();
        }    
      }

    }
  }

  // initialize layer form and all associated filters
  initializeFilterOption(){
    this.initLayerForm(); 

    this.imageFilterOptions(this.mediaList.filter( media => media.mediaType == 'image'));
    this.videoFilterOptions(this.mediaList.filter( media => media.mediaType == 'video'));
    this.bgImageFilterOptions(this.mediaList.filter( media => media.mediaType == 'image'));
    this.screenFilterOptions(this.posScreens);
    this.featureMethodFilterOptions(this.featureMethods);
    this.departmentFilterOptions(this.departments);
    this.menuItemFilterOptions(this.menuItems);
  }

  // initialize board form, only for admin users.
  initLayerForm(){
    this.layerForm = this.formBuilder.group({
      id: [''],
      name: [''],
      type: [''],
      content: [''],
      source: [''],
      screen: [''],
      menuItem: [''],
      featureMethod: [''],
      position: this.formBuilder.group({ 
        top: [0], 
        left: [0] 
      }),
      dimension: this.formBuilder.group({ 
        width: [20], 
        height: [20] 
      }),
      border: this.formBuilder.group({ 
        'border-width': [0], 
        'border-style': ['solid'],
        'border-color': ['#000000'],
        'border-radius': [0]
      }),
      text: this.formBuilder.group({ 
        'text-align': [0], 
        'font-size': [14],
        'font-family': [''],
        'font-weight': ['normal'],
        color: ['#000000'], 
      }),  
      background: this.formBuilder.group({ 
        'background-color': ['#ffffff'],
        'background-image': [''],
        'background-position': [''],
        'background-size': [''],
        'background-repeat': [''], 
      }),
      padding: this.formBuilder.group({
        'padding-top': [0], 
        'padding-bottom': [0], 
        'padding-left': [0], 
        'padding-right': [0]
      }),
      margin: this.formBuilder.group({
        'margin-top': [0], 
        'margin-bottom': [0], 
        'margin-left': [0], 
        'margin-right': [0]
      }),    
      isActive: [''],
      customStyle: this.formBuilder.array([])
    });

    this.updateLayerForm()
    this.onTrackLayerFormChanges();
  }

  // To resolve below issue while buiding for production. Property 'controls' does not exist on type 'AbstractControl'.
	get customStyles() { return <FormArray>this.layerForm.get('customStyle'); }

  /**
   * 
   * @param style 
   * create a new formgroup containing all of the custom style fields. This formgroup can be added to layerForm
   * @returns 
   */ 
  createCustomStyle(style: {property: string, value: string} | undefined): FormGroup {
    if(style){
      return this.formBuilder.group({ property: style.property, value: style.value });
    }
    else{
      return this.formBuilder.group({ property: '', value: '' });
    }
  }

  /**
   * 
   * @param style 
   * Add an empty formGroup built with custom style template into layer.
   */
  onAddCustomStyle(style: {property: string, value: string} | undefined): void {
    const control = <FormArray>this.layerForm.controls['customStyle'];
    control.push(this.createCustomStyle(style));
  }

  /**
	 * 
	 * @param styleIndex 
	 * Remove an custom style formgroup from customStyle FormArray of a given layerForm.
	 */
  onRemoveCustomStyle(styleIndex: number): void {
    const control = <FormArray>this.layerForm.controls['customStyle'];
    control.removeAt(styleIndex);
  }

  /**
	 * 
	 * @param mediaList 
	 * Autocomplete's selection value is an object which can not be displyed in an input box.
	 * This allows us to extract information what need to be displayed in input box
	 * @returns 
	 */
	displayMediaFn(mediaList: FileAndFolderMetadata): string {
		return mediaList ? mediaList.name : '';
	}

  /**
	 * 
	 * @param mediaList 
	 * Narrow down list of image media in image source autocomplete as user types in
	 */
	imageFilterOptions(mediaList: FileAndFolderMetadata[]): void{
		this.filteredImageMediaList = this.imageSourceFormControl.valueChanges
		.pipe(
			startWith(''),
			map( value => typeof value === 'string' ? value: value.name),
			map( (searchString: string) => this.utilAutocompleteService.searchOptionFilter(searchString, mediaList, 'name') )
		);
	}

  /**
	 * 
	 * @param mediaList 
	 * Narrow down list of video media in video source autocomplete as user types in
	 */
	videoFilterOptions(mediaList: FileAndFolderMetadata[]): void{
		this.filteredVideoMediaList = this.videoSourceFormControl.valueChanges
		.pipe(
			startWith(''),
			map( value => typeof value === 'string' ? value: value.name),
			map( (searchString: string) => this.utilAutocompleteService.searchOptionFilter(searchString, mediaList, 'name') )
		);
	}

  /**
	 * 
	 * @param mediaList 
	 * Narrow down list of image media in background image source autocomplete as user types in
	 */
	bgImageFilterOptions(mediaList: FileAndFolderMetadata[]): void{
		this.filteredBackgroundImageMediaList = this.bgImageSourceFormControl.valueChanges
		.pipe(
			startWith(''),
			map( value => typeof value === 'string' ? value: value.name),
			map( (searchString: string) => this.utilAutocompleteService.searchOptionFilter(searchString, mediaList, 'name') )
		);
	}

  /**
	 * 
	 * @param screens 
	 * Narrow down list of screens in screen autocomplete as user types in
	 */
	screenFilterOptions(screens: PosScreen[]): void{
		this.filteredPosScreenList = this.posScreenFormControl.valueChanges
		.pipe(
			startWith(''),
			map( value => typeof value === 'string' ? value: value.name),
			map( (searchString: string) => this.utilAutocompleteService.searchOptionFilter(searchString, screens, 'name') )
		);
	}

  /**
	 * 
	 * @param featureMethods 
	 * Narrow down list of featureMethods in screen autocomplete as user types in
	 */
  featureMethodFilterOptions(featureMethods: FeatureMethod[]): void{
		this.filteredFeatureMethodList = this.featureMethodFormControl.valueChanges
		.pipe(
			startWith(''),
			map( value => typeof value === 'string' ? value: value.name),
			map( (searchString: string) => this.utilAutocompleteService.searchOptionFilter(searchString, featureMethods, 'name') )
		);
	}

  /**
	 * 
	 * @param departments 
	 * Narrow down list of departments in screen autocomplete as user types in
	 */
  departmentFilterOptions(departments: string[]): void{
		this.filteredDepartmentList = this.departmentFormControl.valueChanges
		.pipe(
			startWith(''),
			map( value => typeof value === 'string' ? value: value.name),
			map( (searchString: string) => this.utilAutocompleteService.filterOptions(searchString, departments) )
		);
	}

  /**
	 * 
	 * @param menuItems 
	 * Narrow down list of menuItems in screen autocomplete as user types in
	 */
  menuItemFilterOptions(menuItems: MenuItem[]): void{
		this.filteredMenuItemList = this.menuItemFormControl.valueChanges
		.pipe(
			startWith(''),
			map( value => typeof value === 'string' ? value: value.name),
			map( (searchString: string) => this.utilAutocompleteService.searchOptionFilter(searchString, menuItems, 'name') )
		);
	}

  /**
   * 
   * @param event 
   * @param fieldType 
   * update a form field based on the field type with selected media id.
   */
  selectedSource(event: MatAutocompleteSelectedEvent, fieldType: string){
    switch(fieldType){
      case 'background':
        this.layerForm.patchValue({
          background: {
            'background-image': event.option.value.id
          }
        });
        break;
      case 'screen':
        this.layerForm.patchValue({
          screen: event.option.value.id
        });
        break;
      case 'feature':
        this.layerForm.patchValue({
          featureMethod: event.option.value.id
        });
        break;
      case 'department':
        const menuItemByDepartment = this.menuItems.filter( (item: MenuItem) => item.department === event.option.value)
        this.menuItemFilterOptions(menuItemByDepartment);
        break;
      case 'menuItem':
        this.layerForm.patchValue({
          menuItem: event.option.value.id
        });
        break;
      default:
        this.layerForm.patchValue({
          source: event.option.value.id
        });
        break;
    }
  }

  /**
   * 
   * @param fieldType 
   * remove autocomplete selection and clear layerForm property and corresponding form control.
   */
   removeSource(fieldType: string){
    switch(fieldType){
      case 'background':
        this.layerForm.patchValue({
          background: { 'background-image': '' }
        });

        this.bgImageSourceFormControl.setValue('');
        break;
      case 'screen':
        this.layerForm.patchValue({ screen: '' });
        this.posScreenFormControl.setValue('');
        break;
      case 'feature':
        this.layerForm.patchValue({ featureMethod: '' });
        this.featureMethodFormControl.setValue('');
        break;
      case 'department':
        this.departmentFormControl.setValue('');
        break;
      case 'menuItem':
        this.layerForm.patchValue({ menuItem: '' });
        this.menuItemFormControl.setValue('');
        break;
      default:
        this.layerForm.patchValue({ source: '' });
        this.imageSourceFormControl.setValue('');
        this.videoSourceFormControl.setValue('');
        break;
    }
  }

  // update form with layer details and add necessary fields.
  updateLayerForm(){
    this.layerForm.patchValue({
      id: this.layer.id,
      name: this.layer.name,
      content: this.layer.content,
      type: this.layer.type,
      source: this.layer.source,
      screen: this.layer.screen,
      menuItem: this.layer.menuItem,
      featureMethod: this.layer.featureMethod,
      position: {
        top: this.layer.position.top, 
        left: this.layer.position.left
      },
      dimension: {
        width: this.layer.dimension.width, 
        height: this.layer.dimension.height
      }, 
      border: { 
        'border-width': this.layer.border['border-width'], 
        'border-style': this.layer.border['border-style'],
        'border-color': this.layer.border['border-color'],
        'border-radius': this.layer.border['border-radius']
      },     
      text: { 
        'text-align': this.layer.text['text-align'], 
        'font-size': this.layer.text['font-size'], 
        'font-family': this.layer.text['font-family'],
        'font-weight': this.layer.text['font-weight'],
        color: this.layer.text.color
      },
      background: { 
        'background-color': this.layer.background['background-color'],
        'background-image': this.layer.background['background-image'],
        'background-position': this.layer.background['background-position'],
        'background-size': this.layer.background['background-size'],
        'background-repeat': this.layer.background['background-repeat'],
      },
      padding: {
        'padding-top': this.layer.padding['padding-top'], 
        'padding-bottom': this.layer.padding['padding-bottom'], 
        'padding-left': this.layer.padding['padding-left'], 
        'padding-right': this.layer.padding['padding-right']
      },
      margin: {
        'margin-top': this.layer.margin['margin-top'], 
        'margin-bottom': this.layer.margin['margin-bottom'], 
        'margin-left': this.layer.margin['margin-left'], 
        'margin-right': this.layer.margin['margin-right']
      },
      isActive: this.layer.isActive,
    }, {emitEvent: false});

    for(let i = 0, len = this.layer.customStyle.length; i < len; i++){
      this.onAddCustomStyle(this.layer.customStyle[i]);
    }

    this.updateSourceFromControls();
  }

  /**
   * Every time a new layer loads we would need to update source form controls and 
   * set to empty string if found no value for them.
   */
  updateSourceFromControls(){
    // update either image or video formControl if source exist
    if(this.layer.source && this.layer.source != ''){
      const mediaObj = this.mediaList.filter( media => media.id === this.layer.source)
      
      if(mediaObj.length > 0 && this.layer.type === 'image'){
        this.imageSourceFormControl.setValue(mediaObj[0]);
      }
      else if(mediaObj.length > 0 && this.layer.type === 'video'){
        this.videoSourceFormControl.setValue(mediaObj[0]);
      }
    }
    else{
      this.imageSourceFormControl.setValue('');
      this.videoSourceFormControl.setValue('');
    }


    // update background formControl if background image exist
    if(this.layer.background['background-image'] != ''){
      const mediaObj = this.mediaList.filter( media => media.id === this.layer.background['background-image']);
      if(mediaObj.length > 0) this.bgImageSourceFormControl.setValue(mediaObj[0]);
    }
    else{
      this.bgImageSourceFormControl.setValue('');
    }


    // update featureMethod formControl if featureMethod exist
    if(this.layer.featureMethod && this.layer.featureMethod != ''){
      const featureObj = this.featureMethods.filter( feature => feature.id === this.layer.featureMethod);
      if(featureObj.length > 0) this.featureMethodFormControl.setValue(featureObj[0]);
    }
    else{
      this.featureMethodFormControl.setValue('');
    }


    // update menuItem formControl if menuItem exist
    if(this.layer.menuItem && this.layer.menuItem != ''){
      const menuObj = this.menuItems.filter( menu => menu.id === this.layer.menuItem);
      if(menuObj.length > 0) this.menuItemFormControl.setValue(menuObj[0]);
    }
    else{
      this.menuItemFormControl.setValue('');
    }


    // update screen formControl if screen exist
    if(this.layer.screen && this.layer.screen != ''){
      const screenObj = this.posScreens.filter( screen => screen.id === this.layer.screen);
      if(screenObj.length > 0) this.posScreenFormControl.setValue(screenObj[0]);
    }
    else{
      this.posScreenFormControl.setValue('');
    }
  }

  // As user making chnages to layer we will update canvas with same info.
  onTrackLayerFormChanges(){
    this.subsinks.sink = this.layerForm.valueChanges
    .pipe(
      debounceTime(700)
    )
    .subscribe( (updatedLayer: Layer) => {
      this.fromLayerBroadcast.emitUpdateLayerEvent(updatedLayer)
    });
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
