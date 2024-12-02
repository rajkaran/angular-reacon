import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { FileAndFolderMetadata } from 'src/app/core/models/file-and-folder-metadata.model';
import { PosScreen } from 'src/app/core/models/pos-window.model';
import { UtilAutocompleteService } from 'src/app/core/services/util-autocomplete.service';
import { SubSink } from 'subsink';
import { FromScreenBroadcastService } from '../broadcasts/from-screen-broadcast.service';

@Component({
  selector: 'wx-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.scss']
})
export class ScreenComponent implements OnInit {
  @Input() posScreen: PosScreen;
  @Input() mediaList: FileAndFolderMetadata[];

  bgImageSourceFormControl: FormControl = new FormControl(''); 
  filteredBackgroundImageMediaList: Observable<FileAndFolderMetadata[]>;
  screenForm: FormGroup;
  subsinks: SubSink = new SubSink();

  constructor(
    public snackBar: MatSnackBar, private formBuilder: FormBuilder,
    private fromScreenBroadcast: FromScreenBroadcastService,
    private utilAutocompleteService: UtilAutocompleteService
  ) { }

  ngOnInit(): void { }

  ngOnChanges() {
    this.initScreenForm(); 
    this.bgImageFilterOptions(this.mediaList)
  }

  // initialize board form, only for admin users.
  initScreenForm(){
    this.screenForm = this.formBuilder.group({
      id: [''],
      name: [''],
      background: this.formBuilder.group({ 
        'background-color': ['#ffffff'],
        'background-image': [''],
        'background-position': [''],
        'background-size': [''],
        'background-repeat': [''], 
      }),
      customStyle: this.formBuilder.array([])
    });

    this.updateScreenForm()
    this.onTrackScreenFormChanges();
  }

  // To resolve below issue while buiding for production. Property 'controls' does not exist on type 'AbstractControl'.
	get customStyles() { return <FormArray>this.screenForm.get('customStyle'); }

  /**
   * 
   * @param style 
   * create a new formgroup containing all of the custom style fields. This formgroup can be added to screenForm
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
   * Add an empty formGroup built with custom style template into screen.
   */
  onAddCustomStyle(style: {property: string, value: string} | undefined): void {
    const control = <FormArray>this.screenForm.controls['customStyle'];
    control.push(this.createCustomStyle(style));
  }

  /**
	 * 
	 * @param styleIndex 
	 * Remove an custom style formgroup from customStyle FormArray of a given screenForm.
	 */
  onRemoveCustomStyle(styleIndex: number): void {
    const control = <FormArray>this.screenForm.controls['customStyle'];
    control.removeAt(styleIndex);
  }

  // update form with layer details and add necessary fields.
  updateScreenForm(){
    this.screenForm.patchValue({
      id: this.posScreen.id,
      name: this.posScreen.name,
      background: { 
        'background-color': this.posScreen.background['background-color'],
        'background-image': this.posScreen.background['background-image'],
        'background-position': this.posScreen.background['background-position'],
        'background-size': this.posScreen.background['background-size'],
        'background-repeat': this.posScreen.background['background-repeat'],
      }
    }, {emitEvent: false});

    for(let i = 0, len = this.posScreen.customStyle.length; i < len; i++){
      this.onAddCustomStyle(this.posScreen.customStyle[i]);
    }
  }

  // As user making changes to screen form we will update canvas with same info.
  onTrackScreenFormChanges(){
    this.subsinks.sink = this.screenForm.valueChanges
    .pipe(
      debounceTime(700)
    )
    .subscribe( (updatedScreen: PosScreen) => {
      updatedScreen.layers = this.posScreen.layers;
      this.fromScreenBroadcast.emitUpdateScreenEvent(updatedScreen)
    });
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
   * @param event 
   * @param fieldType 
   * update a form field based on the field type with selected media id.
   */
  selectedSource(event: MatAutocompleteSelectedEvent, fieldType: string){
    switch(fieldType){
      case 'background':
        this.screenForm.patchValue({
          background: {
            'background-image': event.option.value.id
          }
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
        this.screenForm.patchValue({
          background: { 'background-image': '' }
        });

        this.bgImageSourceFormControl.setValue('');
        break;
    }
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
