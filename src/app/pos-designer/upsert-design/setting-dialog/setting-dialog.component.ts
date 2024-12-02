import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { merge, throwError } from 'rxjs';
import { catchError, concatMap, debounceTime, filter, map } from 'rxjs/operators';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { PosWindow } from 'src/app/core/models/pos-window.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { SubSink } from 'subsink';
import { PosWindowService } from '../../repositories/pos-window.service';
import { UtilDesignService } from '../services/util-design.service';

@Component({
  selector: 'wx-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.scss']
})
export class SettingDialogComponent implements OnInit {

  settingForm: FormGroup;
  
  isSaving: boolean = false;
  subsinks: SubSink = new SubSink();

  constructor(
    public snackBar: MatSnackBar, public dialog: MatDialog,
    private utilDesignService: UtilDesignService,
    private interpretServerErrorService: InterpretServerErrorService,
    private posWindowService: PosWindowService,
    public dialogRef: MatDialogRef<SettingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {posWindow: PosWindow, organizationId: string, dropdownOptions: {[key: string]: DropdownOption[]}}
  ) { }

  ngOnInit(): void {
    this.initSettingForm();
    // return this.fileAndFolderMetadataService.getfilesFromFolder('My Drive', this.organizationId)
  }

  // Initialize settingForm
  initSettingForm(){
    this.settingForm = new FormGroup({
      name: new FormControl('', Validators.required),
      alias: new FormControl('', Validators.required),
      canvasWidth: new FormControl('', Validators.required),
      canvasHeight: new FormControl('', Validators.required),
      designWidth: new FormControl('', Validators.required),
      designHeight: new FormControl('', Validators.required),
      aspectRatio: new FormGroup({
        width: new FormControl('', Validators.required),
        height: new FormControl('', Validators.required),
      })
    });

    this.updateSettingForm();
    this.calculateCanvasAndDesignDimension();
    this.checkAliasUnique();
  }

  // Update settingForm fields with data from loaded board
  updateSettingForm(){
    this.settingForm.patchValue({
      name: this.data.posWindow.name,
      alias: this.data.posWindow.alias,
      canvasWidth: this.data.posWindow.canvasWidth,
      canvasHeight: this.data.posWindow.canvasHeight,
      designWidth: this.data.posWindow.designWidth,
      designHeight: this.data.posWindow.designHeight,
      aspectRatio:  this.data.posWindow.aspectRatio,
    }, {emitEvent: false});
  }

  // convenience getter for easy access to form fields
  get f() { return this.settingForm.controls; }


  /**
   * 
   * @param font 
   * create a new formgroup containing all of the Google Font Link fields. This formgroup can be added to layerForm
   * @returns 
   */ 
  createGoogleFontLink(font: {family: string, link: string} | undefined) {
    // if(font){
    //   return this.formBuilder.group({ family: font.family, link: font.link });
    // }
    // else{
    //   return this.formBuilder.group({ family: '', link: '' });
    // }
  }


  /**
   * 
   * @param font 
   * Add an empty formGroup built with Google Font Link template into layer.
   */
  onAddGoogleFont(font: {family: string, link: string} | undefined): void {
    // const control = <FormArray>this.layerForm.controls['googleFontLink'];
    // control.push(this.createGoogleFontLink(font));
  }

  /**
   * 
   * @param fontIndex 
   * Remove an Google Font Link formgroup from googleFontLink FormArray of a given layerForm.
   */
  onRemoveGoogleFont(fontIndex: number): void {
    // const control = <FormArray>this.layerForm.controls['googleFontLink'];
    // control.removeAt(fontIndex);
  }

  // calculate height as width or aspect ratio is changed
  calculateCanvasAndDesignDimension(){

    let canvasWidthObservable = this.settingForm.get('canvasWidth')!.valueChanges
    .pipe(
      map( (value: number) => ['canvasWidth', value])
    );

    let designWidthObservable = this.settingForm.get('designWidth')!.valueChanges
    .pipe(
      map( (value: number) => ['designWidth', value])
    );

    let aspectRatioObservable = this.settingForm.get('aspectRatio')!.valueChanges
    .pipe(
      map( (value: {width: string, height: string}) => ['aspectRatio', value])
    );

    this.subsinks.sink = merge(canvasWidthObservable, designWidthObservable, aspectRatioObservable)
    .pipe(
      debounceTime(500),
    )
    .subscribe( ([field, value]) => {
      if(field == 'canvasWidth'){
        let calculatedHeight = this.utilDesignService.calculateHeightForAspectRatio(<number>value, this.settingForm.value.aspectRatio);
        this.settingForm.patchValue({canvasHeight: calculatedHeight});

        // design width can never be less than canvas width.
        if(this.settingForm.value.designWidth == undefined || this.settingForm.value.designWidth == '' || this.settingForm.value.designWidth < (<number>value)){
          this.settingForm.patchValue({designWidth: <number>value});
        }
      }
      else if(field == 'designWidth'){
        let calculatedHeight = this.utilDesignService.calculateHeightForAspectRatio(<number>value, this.settingForm.value.aspectRatio);
        this.settingForm.patchValue({designHeight: calculatedHeight});
      }
      else{
        let calculatedCanvasHeight = this.utilDesignService.calculateHeightForAspectRatio(this.settingForm.value.canvasWidth, <{width: string, height: string}>value);
        let calculatedDesignHeight = this.utilDesignService.calculateHeightForAspectRatio(this.settingForm.value.designWidth, <{width: string, height: string}>value);
        this.settingForm.patchValue({canvasHeight: calculatedCanvasHeight});
        this.settingForm.patchValue({designHeight: calculatedDesignHeight});
      }
    });
  }

  // We need to have a unique alias for each pos atleast within the organization.
  checkAliasUnique(){
    const aliasControl = this.settingForm.get('alias') as FormControl;

    this.subsinks.sink = aliasControl.valueChanges
    .pipe(
      filter( (value: string) => aliasControl.valid),
      concatMap( (value: string) => this.posWindowService.validateAlias(value, this.data.organizationId)),
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe(res => {
      aliasControl.setErrors(null);
    }, (appropriateError: {msg: string, status: number}) => {
      aliasControl.setErrors({'Alias is not unique': true});

      this.displayError(appropriateError.msg, appropriateError.status);
      this.checkAliasUnique(); //restart subscription
    });
  }

  // Close dialog box with none to return
  onClose(){
    this.dialogRef.close();
  }

  // update board with name, aspect ratio and assets
  onSubmit(){
    if(this.settingForm.valid){
      this.isSaving = true;
      
      this.subsinks.sink = this.posWindowService.patchPosWindow(this.data.posWindow.id || '', this.settingForm.value, this.data.organizationId)
      .pipe(
        catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
      )
      .subscribe( (poswindow: null) => {
        this.isSaving = false;
        this.dialogRef.close(this.settingForm.value);
        this.displayError(`Settings updated.`, 200);
      },(appropriateError) => {
        this.displayError(appropriateError.msg, appropriateError.status);
        this.isSaving = false;
      });
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
