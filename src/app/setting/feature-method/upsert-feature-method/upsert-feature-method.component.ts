import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { concat, of, throwError } from 'rxjs';
import { catchError, concatMap, filter } from 'rxjs/operators';
import { SubSink } from 'subsink';

import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { FeatureMethod } from 'src/app/core/models/feature-method.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { FeatureMethodService } from '../repositories/feature-method.service';

@Component({
  selector: 'wx-upsert-feature-method',
  templateUrl: './upsert-feature-method.component.html',
  styleUrls: ['./upsert-feature-method.component.scss']
})
export class UpsertFeatureMethodComponent implements OnInit {
  @ViewChild('formDirective') private formDirective: NgForm;

  featureMethodForm: FormGroup;
  featureMethodList: FeatureMethod[];
  organizationId: string;

  isEditing: boolean = false;
  isSaving: boolean = false;
  loadedPair: {id: string, index: number} = {id: '', index: -1};
  subsinks: SubSink = new SubSink();

  constructor(
    private featureMethodService: FeatureMethodService,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
		private formBuilder: FormBuilder,
    private interpretServerErrorService: InterpretServerErrorService,
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';

    this.secureLayoutBroadcast.emitPageTitleEvent('Create Feature Methods');

    this.initFeatureMethodForm();
    this.fetchFeatureMethod();
  }

  // initialize featureMethod form with default values
	initFeatureMethodForm(){
		this.featureMethodForm = this.formBuilder.group({
      name: [''],
      declaration: ['', Validators.required],
      description: [''],
      organizationId: [this.organizationId],
      isActive: [true],
    });
	}

  // fetch list of feature methods associated to current user's organization.
  fetchFeatureMethod(){
    this.subsinks.sink = this.featureMethodService.fetchAllFeatureMethod(this.organizationId)   
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (methods: FeatureMethod[]) => {
      this.featureMethodList = methods;
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  /**
   * Inorder to reset a form to it's default state we would perform following operations
   * set loaded pair to empty or none.
   * reset Angular internal properties such as touched, valid etc.
   * revert formgroup to default values.
   * reset form directive as reseting form is not enough to clear errors and touched entries.
   */
  resetFeatureMethodForm(){
    this.loadedPair = {id: '', index: -1};

    this.featureMethodForm.reset();
    this.formDirective.resetForm();

    this.featureMethodForm.patchValue({
      name: '',
			declaration: '',
      description: '',
      organizationId: this.organizationId,
      isActive: true,
    });
  }

  // update formgroup with selected featureMethod
  updateFeatureMethodForm(featureMethod: FeatureMethod){
    this.featureMethodForm.patchValue({
      name: featureMethod.name,
			declaration: featureMethod.declaration,
      description: featureMethod.description,
      organizationId: featureMethod.organizationId,
      isActive: featureMethod.isActive
    });
  }

  /**
   * 
   * @param state 
   * @param index 
   * Activate or Deactivate a featureMethod by just flipping toggle button.
   */
  onChange(state: MatSlideToggleChange, index: number){
    this.isEditing = true;

    this.subsinks.sink = this.featureMethodService.patchFeatureMethod(this.featureMethodList[index].id || '', {isActive: state.checked}, this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (pair: null) => {
      this.featureMethodList[index].isActive = state.checked;
      this.isEditing = false;
      this.resetFeatureMethodForm();
    }, (appropriateError: {msg: string, status: number}) => {
      this.isEditing = false;
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  /**
   * 
   * @param id 
   * @param index 
   * To edit a featureMethod it has to be loaded into form first. cache id and index of pair being select for edit.
   */
  onLoad(id: string, index: number){
    this.loadedPair = {id: id, index: index};

    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.updateFeatureMethodForm(this.featureMethodList[index]);
  }

  // This function persists the changes by with creating a new featureMethod or editing an existing one.
  onSubmit(){

    if(!this.featureMethodForm.valid) return;

    this.isSaving = true;

    const createObservable = of(this.loadedPair.index)
    .pipe(
      filter( (index: number) => index === -1),
      concatMap( (index: number) => {
        this.featureMethodForm.value.createDatetime = new Date();

        return this.featureMethodService.createFeatureMethod(this.featureMethodForm.value, this.organizationId)
      })
    );

    const editObservable = of(this.loadedPair.index)
    .pipe(
      filter( (index: number) => index !== -1),
      concatMap( (index: number) => {
        return this.featureMethodService.patchFeatureMethod(this.loadedPair.id, this.featureMethodForm.value, this.organizationId)
      })
    );

    this.subsinks.sink = concat(createObservable, editObservable)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (featureMethod: FeatureMethod | null) => {
      if(this.loadedPair.index === -1){
        this.featureMethodList.push(<FeatureMethod>featureMethod);
      }
      else{
        this.featureMethodList[this.loadedPair.index].name = this.featureMethodForm.value.name;
        this.featureMethodList[this.loadedPair.index].declaration = this.featureMethodForm.value.declaration;
        this.featureMethodList[this.loadedPair.index].description = this.featureMethodForm.value.description;
      }

      this.isSaving = false;
      this.resetFeatureMethodForm();
    }, (appropriateError: {msg: string, status: number}) => {
      this.isSaving = false;
      this.displayError(appropriateError.msg, appropriateError.status);
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
