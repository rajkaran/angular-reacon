import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { concat, of, throwError } from 'rxjs';
import { map, concatMap, catchError, filter } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SubSink } from 'subsink';
import { MatChipInputEvent } from '@angular/material/chips';

import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { AuthorizationMatrix, Matrix } from 'src/app/core/models/authorization-matrix.model';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { AuthorizationMatrixService } from '../repositories/authorization-matrix.service';
import { KeyValuePairService } from '../../key-value-pair/repositories/key-value-pair.service';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';

@Component({
  selector: 'wx-upsert-authorization-matrix',
  templateUrl: './upsert-authorization-matrix.component.html',
  styleUrls: ['./upsert-authorization-matrix.component.scss']
})
export class UpsertAuthorizationMatrixComponent implements OnInit {

  id: string;
	organizationId: string;
	authorizationMatrix: AuthorizationMatrix;
	authorizationMatrixForm: FormGroup;
	scopeInputBox: FormControl = new FormControl('');
	action: string = 'Create';
	isSaving: boolean = false;

  dropdownOptions: {[key: string]: DropdownOption[]} = {roleTypes: [], organizationTypes: [], authMatrixTarget: []};
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  subsinks: SubSink = new SubSink();

  constructor(
    private authorizationMatrixService: AuthorizationMatrixService,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
		private formBuilder: FormBuilder, private router: Router,
    private keyValuePairService: KeyValuePairService,
    private interpretServerErrorService: InterpretServerErrorService,
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
	  this.id = this.route.snapshot.paramMap.get("id") || 'none';
		this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';

    if(this.id != 'none'){
      this.fetchAuthorizationMatrixForId();
      this.action = 'Edit';
    }

    this.secureLayoutBroadcast.emitPageTitleEvent(this.action+' Authorization Matrix');

		this.initAuthorizationMatrixForm();
    this.fetchAllDropDownOptions();
  }

  // initialize authorizationMatrix form with default values
	initAuthorizationMatrixForm(){
		this.authorizationMatrixForm = this.formBuilder.group({
			resource: [''],
			scopes: [''],
      note: [''],
			organizationId: [this.organizationId],
			isActive: true,
      matrix: this.formBuilder.array([])
    });
	}

	// To resolve below issue while buiding for production. Property 'controls' does not exist on type 'AbstractControl'.
	get matrices() { return <FormArray>this.authorizationMatrixForm.get('matrix'); }

  /**
	 * 
	 * @param matrix 
	 * create a formgroup containing all the editable fields. This formgroup will become a matrix item in authorizationMatrix form.
	 */
  createMatrix(matrix: Matrix|undefined): FormGroup {
    if(matrix){
      return this.formBuilder.group({ roles: [matrix.roles], organizationTypes: [matrix.organizationTypes], targets: [matrix.targets] });
    }
    else{
      return this.formBuilder.group({ roles: '', organizationTypes: '', targets: '' });
    }
	}
	
	/**
	 * 
	 * @param matrix 
	 * Add a formGroup on demand into authorizationMatrix form.
	 */
  addMatrix(matrix: Matrix|undefined): void {
    const control = <FormArray>this.authorizationMatrixForm.controls['matrix'];
    control.push(this.createMatrix(matrix));
	}
	
	/**
	 * 
	 * @param matrixIndex 
	 * Remove a matrix from authorizationMatrix form
	 */
  removeMatrix(matrixIndex: number): void {
    const control = <FormArray>this.authorizationMatrixForm.controls['matrix'];
    control.removeAt(matrixIndex);
	}

  onAdd(event: MatChipInputEvent) {
		if (event.value) {
			let newScope = this.scopeInputBox.value.trim();
			let currentScopes: string[] = this.authorizationMatrixForm.value.scopes;

			if(Array.isArray(currentScopes) == false) currentScopes = [];
			currentScopes.push(newScope);

      this.authorizationMatrixForm.get('scopes')?.setValue(currentScopes)
			this.scopeInputBox.patchValue('');
		}
	}

  onRemove(scope: string) {
		let currentScopes: string[] = this.authorizationMatrixForm.value.scopes;

		const index = currentScopes.indexOf(scope);
		if(index != -1) currentScopes.splice(index, 1);

    this.authorizationMatrixForm.get('scopes')?.setValue(currentScopes);
	}

  // fetch drop down options from keyValuePairs
  fetchAllDropDownOptions(){
    this.subsinks.sink = this.keyValuePairService.fetchDropdownOptions( ['roleTypes', 'organizationTypes', 'authMatrixTarget'], this.organizationId )
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )       
    .subscribe( (allDropdownOptions: {[key: string]: DropdownOption[]}) => {
      this.dropdownOptions = allDropdownOptions;
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  // Fetch authorization matrix for a given id
	fetchAuthorizationMatrixForId(){
		this.subsinks.sink = this.authorizationMatrixService.fetchMatrixById(this.id, this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    ) 
		.subscribe( (matrix: AuthorizationMatrix) => {
			this.authorizationMatrix = matrix;
			this.updateAuthorizationMatrixForm();
		}, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
	}

	// update authorizationMatrix form with details retrived for given id
	updateAuthorizationMatrixForm(){
		if(this.authorizationMatrix){

			this.authorizationMatrixForm.patchValue({ 
				resource: this.authorizationMatrix.resource,
				scopes: this.authorizationMatrix.scopes,
        note: this.authorizationMatrix.note,
				organizationId: this.authorizationMatrix.organizationId,
				isActive: this.authorizationMatrix.isActive
			});

			for(let i = 0, length = this.authorizationMatrix.matrix.length; i < length; i++){
				this.addMatrix(this.authorizationMatrix.matrix[i]);
			}
		}
	}

  /**
	 * when user clicks on submit button application will decide whether to create a new authorizationMatrix or edit an existing one.
	 * this.id value plays important role in that decision, if id is none then create a new one otherwise edit fetched.
	 */
	onSubmit(){
		this.isSaving = true;

		const creatingOrganization = of(this.id).pipe(
			filter( () => this.id == 'none'),
			concatMap( () => this.authorizationMatrixService.createMatrix(this.authorizationMatrixForm.value, this.organizationId) )
		);

		const updatingOrganization = of(this.id).pipe(
			filter( () => this.id != 'none'),
			concatMap( () => this.authorizationMatrixService.patchMatrix(this.id, this.organizationId, this.authorizationMatrixForm.value) )
		);

		this.subsinks.sink = concat(creatingOrganization, updatingOrganization)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    ) 
		.subscribe( (auth: AuthorizationMatrix | null) => {
			this.router.navigate(['/setting/authorizationMatrix/list', this.organizationId]);
		},(appropriateError: {msg: string, status: number}) => {
			this.displayError(appropriateError.msg, appropriateError.status);
			this.isSaving = false;
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
