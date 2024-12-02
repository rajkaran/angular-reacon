import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { concat, forkJoin, of, throwError } from 'rxjs';
import { catchError, concatMap, filter } from 'rxjs/operators';
import { SubSink } from 'subsink';

import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption, KeyValuePair } from 'src/app/core/models/key-value-pair.model';
import { KeyValuePairService } from '../repositories/key-value-pair.service';
import { UtilKeyValuePairService } from '../services/util-key-value-pair.service';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';

@Component({
  selector: 'wx-upsert-key-value-pair',
  templateUrl: './upsert-key-value-pair.component.html',
  styleUrls: ['./upsert-key-value-pair.component.scss']
})
export class UpsertKeyValuePairComponent implements OnInit, OnDestroy {
  @ViewChild('formDirective') private formDirective: NgForm;

  filteredKeyValuePairs: KeyValuePair[];
  keyValuePairForm: FormGroup;
  keyValuePairs: KeyValuePair[];
  organizationId: string;

  categoryFormControl: FormControl = new FormControl('');
  dropdownOptions: {[key: string]: DropdownOption[]} = {pairStatus: []};
  loadedPair: {id: string, index: number} = {id: '', index: -1};
  pairTypes: string[] = [];
  isSaving: boolean = false;
  isEditing: boolean = false;
  statusFormControl: FormControl = new FormControl('any');
  subsinks: SubSink = new SubSink();

  constructor(
    private keyValuePairService: KeyValuePairService,
    private utilKeyValuePairService: UtilKeyValuePairService,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
		private formBuilder: FormBuilder,
    private interpretServerErrorService: InterpretServerErrorService,
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';

    this.secureLayoutBroadcast.emitPageTitleEvent('System Settings');

    this.initKeyValuePairForm();
    this.fetchKeyValuePair();
    this.tapSelectValueChanges();
  }

  // initialize keyValuePair form with default values
	initKeyValuePairForm(){
		this.keyValuePairForm = this.formBuilder.group({
			identifier: ['', Validators.required],
			pairValue: [''],
      pairType: ['', Validators.required],
    });
	}

  // fetch list of key-value pairs associated to current user's organization.
  fetchKeyValuePair(){
    this.subsinks.sink = forkJoin([
      this.keyValuePairService.fetchDropdownOptions(['pairStatus'], this.organizationId),
      this.keyValuePairService.fetchAllPairs(this.organizationId)
    ])    
    .pipe(
      concatMap( ([allDropdownOptions, pairs]) => {
        this.keyValuePairs = <KeyValuePair[]>pairs;
        this.dropdownOptions = allDropdownOptions;
        return this.utilKeyValuePairService.extractPairtypes(this.keyValuePairs)
      }),
      concatMap( (types: string[]) => {
        this.pairTypes = types;

        if(this.pairTypes.length > 0){
          this.categoryFormControl.setValue(this.pairTypes[0]);
        }

        return this.utilKeyValuePairService.filterKeyValuePair(this.keyValuePairs, this.categoryFormControl.value, this.statusFormControl.value);
      }),
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (filteredPairs: KeyValuePair[]) => {
      this.filteredKeyValuePairs = filteredPairs;
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    })
  }

  // update key-value pair list as user makes selection to filter dropdowns.
  tapSelectValueChanges(){
    this.subsinks.sink = concat(this.categoryFormControl.valueChanges, this.statusFormControl.valueChanges) 
    .pipe(
      concatMap( (value: string) => {
        return this.utilKeyValuePairService.filterKeyValuePair(this.keyValuePairs, this.categoryFormControl.value, this.statusFormControl.value)
      })
    )
    .subscribe( (filteredPairs: KeyValuePair[]) => {
      this.filteredKeyValuePairs = filteredPairs;
    });
  }

  /**
   * Inorder to reset a form to it's default state we would perform following operations
   * set loaded pair to empty or none.
   * reset Angular internal properties such as touched, valid etc.
   * revert formgroup to default values. 
   */
  resetKeyValuePairForm(){
    this.loadedPair = {id: '', index: -1};

    this.keyValuePairForm.reset();

    this.keyValuePairForm.patchValue({
      identifier: '',
			pairValue: '',
      pairType: '',
    });

    this.formDirective.resetForm();
  }

  // update formgroup with selected key-value pair
  updateKeyValuePairForm(keyValuePair: KeyValuePair){
    this.keyValuePairForm.patchValue({
      identifier: keyValuePair.identifier,
			pairValue: keyValuePair.pairValue,
      pairType: keyValuePair.pairType
    });
  }

  /**
   * 
   * @param state 
   * @param index 
   * Activate or Deactivate a pair by just flipping toggle button.
   */
  onChange(state: MatSlideToggleChange, index: number){
    this.isEditing = true;

    this.subsinks.sink = this.keyValuePairService.patchPair(this.filteredKeyValuePairs[index].id, {isActive: state.checked}, this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (pair: null) => {
      this.filteredKeyValuePairs[index].isActive = state.checked;
      this.isEditing = false;
      this.resetKeyValuePairForm();
    }, (appropriateError: {msg: string, status: number}) => {
      this.isEditing = false;
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  /**
   * 
   * @param id 
   * @param index 
   * To edit a key-value pair it has to be loaded into form first. cache id and index of pair being
   * select for edit.
   */
  onLoad(id: string, index: number){
    this.loadedPair = {id: id, index: index};

    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.updateKeyValuePairForm(this.filteredKeyValuePairs[index]);
  }

  // This function persists the changes by with creating a new pair or editing an existing one.
  onSubmit(){

    if(!this.keyValuePairForm.valid) return;

    this.isSaving = true;

    const createObservable = of(this.loadedPair.index)
    .pipe(
      filter( (index: number) => index === -1),
      concatMap( (index: number) => {
        this.keyValuePairForm.value.organizationId = this.organizationId;
        this.keyValuePairForm.value.isActive = true;
        this.keyValuePairForm.value.createDatetime = new Date();

        return this.keyValuePairService.createPair(this.keyValuePairForm.value, this.organizationId)
      })
    );

    const editObservable = of(this.loadedPair.index)
    .pipe(
      filter( (index: number) => index !== -1),
      concatMap( (index: number) => {
        return this.keyValuePairService.patchPair(this.loadedPair.id, this.keyValuePairForm.value, this.organizationId)
      })
    );

    this.subsinks.sink = concat(createObservable, editObservable)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (pair: KeyValuePair | null) => {
      if(this.loadedPair.index === -1){
        this.keyValuePairs.push(<KeyValuePair>pair);

        if(this.pairTypes.indexOf( (<KeyValuePair>pair).pairType ) === -1){
          this.pairTypes.push((<KeyValuePair>pair).pairType);
          this.categoryFormControl.setValue((<KeyValuePair>pair).pairType);
        }
        else{
          this.filteredKeyValuePairs.push(<KeyValuePair>pair);
        }
      }
      else{
        this.filteredKeyValuePairs[this.loadedPair.index].identifier = this.keyValuePairForm.value.identifier;
        this.filteredKeyValuePairs[this.loadedPair.index].pairValue = this.keyValuePairForm.value.pairValue;
        this.filteredKeyValuePairs[this.loadedPair.index].pairType = this.keyValuePairForm.value.pairType;
      }

      this.isSaving = false;
      this.resetKeyValuePairForm();
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
