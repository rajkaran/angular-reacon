import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { concat, forkJoin, of, throwError } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SubSink } from 'subsink';

import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { Address, Contact, Organization, Phone, OperationHour, ServiceCharge, SocialMedia, Tax } from 'src/app/core/models/organization.model';
import { KeyValuePairService } from 'src/app/setting/key-value-pair/repositories/key-value-pair.service';
import { OrganizationService } from '../repositories/organization.service';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { catchError, concatMap, filter, tap } from 'rxjs/operators';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { UtilOrganizationService } from '../services/util-organization.service';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';

@Component({
  selector: 'wx-upsert-organization',
  templateUrl: './upsert-organization.component.html',
  styleUrls: ['./upsert-organization.component.scss']
})
export class UpsertOrganizationComponent implements OnInit, OnDestroy {

  id: string;
  organization: Organization;
  organizationId: string;
  organizationForm: FormGroup;

  action: string = 'Create';
  dropdownOptions: {[key: string]: DropdownOption[]} = {salutations: [], contactWays: [], contactTypes: [], phoneTypes: [], provinces: [], 
    countries: [], businessTypes: [], socialMediaIcons: [], addressTypes: [], days: [], taxes: []};
  isSaving: boolean = false;
  subsinks: SubSink = new SubSink();

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    private organizationService: OrganizationService,
    private keyValuePairService: KeyValuePairService,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
		private formBuilder: FormBuilder, private router: Router,
    private localStorageCacheService: LocalStorageCacheService,
    private interpretServerErrorService: InterpretServerErrorService,
    private utilOrganizationService: UtilOrganizationService,
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';
    this.id = this.route.snapshot.paramMap.get("id") || 'none';
		
		if(this.id != 'none'){
      this.fetchOrganization();
      this.action = 'Edit';
    }

    this.fetchAllDropDownOptions();
		this.initOrganizationForm();
  }

  // initialize board form, only for admin users.
  initOrganizationForm(){
    this.organizationForm = this.formBuilder.group({
			name: ['', Validators.required],
      businessType: ['', Validators.required],
      website: [''],
      location: this.formBuilder.group({ 
        type: [''], 
        coordinates: [''] 
      }),
			address: this.formBuilder.array([]),
			contact: this.formBuilder.array([]),
      socialMedia: this.formBuilder.array([]),
      operationHour: this.formBuilder.array([]),
      statutoryHolidayHour: this.formBuilder.array([]),
      tax: this.formBuilder.array([]),
      menu: this.formBuilder.array([]),
			vendorId: [this.organizationId],
      organizationType: ['store'], // default to store finding this in db will indicate code bug
      serviceCharge: this.formBuilder.array([]),
      onlineOrder: this.formBuilder.group({ 
        delivery: [false], 
        pickup: [false] 
      }),
			isActive: [true],
      isDeleted: [false],
      isOpened: [false],
      createDatetime: [new Date()],
      storage: this.formBuilder.array([this.formBuilder.group({ container: 1, count: 0, size: 0 })])    
		});

    if(this.id == 'none'){
      this.determineOrganizationType();
      this.onAddAddress(undefined);
      this.onAddContact(undefined);
      this.onAddOperationHour(undefined);
      this.onAddStatutoryHolidayHour(undefined);
      this.onAddTax(undefined);
      this.onAddServiceCharge(undefined);
      this.onAddSocialMedia(undefined);
    }
	}

  // To resolve below issue while buiding for production. Property 'controls' does not exist on type 'AbstractControl'.
	get addresses() { return <FormArray>this.organizationForm.get('address'); }
	get contacts() { return <FormArray>this.organizationForm.get('contact'); }
  get operationHours() { return <FormArray>this.organizationForm.get('operationHour'); }
  get statutoryHolidayHours() { return <FormArray>this.organizationForm.get('statutoryHolidayHour'); } 
  get taxes() { return <FormArray>this.organizationForm.get('tax'); }
  get serviceCharges() { return <FormArray>this.organizationForm.get('serviceCharge'); }
  get socialMedias() { return <FormArray>this.organizationForm.get('socialMedia'); }
  getPhoneNumbers(frmGrp: any, key: string) { return (<FormArray>(<FormGroup>frmGrp).controls[key]).controls; }

  /**
	 * 
	 * @param address 
	 * create a new formgroup containing all of the address fields. This formgroup can be added to organizationForm
	 */ 
  createAddress(address: Address|undefined): FormGroup {
    if(address){
      return this.formBuilder.group({
        addressLine1: address.addressLine1, addressLine2: address.addressLine2, city: address.city, province: address.province, 
        postalCode: address.postalCode, country: address.country, addressType: address.addressType, latitude: address.latitude, 
        longitude: address.longitude
      });
    }
    else{
      return this.formBuilder.group({
        addressLine1: '', addressLine2: '', city: '', province: '', postalCode: '', country: '', addressType: '', latitude: '', longitude: ''
      });
    }
  }

  /**
	 * 
	 * @param contact 
	 * create a new formgroup containing all of the contact fields. This formgroup can be added to organizationForm
	 */ 
  createContact(contact: Contact|undefined): FormGroup {
    if(contact){
      let contactForm: FormGroup = this.formBuilder.group({
        salutation: contact.salutation, givenName: contact.givenName, familyName: contact.familyName, email: '',
        emailInputBox: '', preferredWay: contact.preferredWay, designation: contact.designation, type: contact.type,
        phone: this.formBuilder.array([])
      });

      contactForm.get('email')?.setValue(contact.email);
      return contactForm
    }
    else{
      return this.formBuilder.group({
        salutation: '', givenName: '', familyName: '', email: '', emailInputBox: '', preferredWay: '', designation: '', type: '', 
        phone: this.formBuilder.array([this.createPhone(undefined)])
      });
    }
  }

  /**
	 * 
	 * @param phone 
	 * create a new formgroup containing all of the phone fields. This formgroup can be added to organizationForm
	 */ 
  createPhone(phone: Phone|undefined): FormGroup {
    if(phone){
        return this.formBuilder.group({number: phone.number, ext: phone.ext, type: phone.type});
    }
    else{
        return this.formBuilder.group({number: '', ext: '', type: ''});
    }
  }

  /**
	 * 
	 * @param operationHour 
	 * create a new formgroup containing all of the operation hour fields. This formgroup can be added to storeForm
	 */ 
  createOperationHour(operationHour: OperationHour|undefined): FormGroup {
    if(operationHour){
        return this.formBuilder.group({day: operationHour.day, openAt: operationHour.openAt, closeAt: operationHour.closeAt});
    }
    else{
        return this.formBuilder.group({day: '', openAt: '', closeAt: ''});
    }
  }

  /**
	 * 
	 * @param holidayHour 
	 * create a new formgroup containing all of the statutory holiday operation hour fields. This formgroup can be added to storeForm
	 */ 
  createStatutoryHolidayHour(holidayHour: OperationHour|undefined): FormGroup {
    if(holidayHour){
        return this.formBuilder.group({day: holidayHour.day, openAt: holidayHour.openAt, closeAt: holidayHour.openAt});
    }
    else{
        return this.formBuilder.group({day: '', openAt: '', closeAt: ''});
    }
  }

  /**
	 * 
	 * @param charge 
	 * create a new formgroup containing all of the Service Charge fields. This formgroup can be added to storeForm
	 */ 
  createServiceCharge(charge: ServiceCharge|undefined): FormGroup {
    if(charge){
        return this.formBuilder.group({name: charge.name, percent: charge.percent, amount: charge.amount});
    }
    else{
        return this.formBuilder.group({name: '', percent: '', amount: ''});
    }
  }

  /**
	 * 
	 * @param tax 
	 * create a new formgroup containing all of the Tax fields. This formgroup can be added to storeForm
	 */ 
  createTax(tax: Tax|undefined): FormGroup {
    if(tax){
        return this.formBuilder.group({name: tax.name, percent: tax.percent});
    }
    else{
        return this.formBuilder.group({name: '', percent: ''});
    }
  }

  /**
	 * 
	 * @param socialMedia 
	 * create a new formgroup containing all of the SocialMedia fields. This formgroup can be added to storeForm
	 */ 
  createSocialMedia(socialMedia: SocialMedia|undefined): FormGroup {
    if(socialMedia){
        return this.formBuilder.group({platform: socialMedia.platform, url: socialMedia.url});
    }
    else{
        return this.formBuilder.group({platform: '', url: ''});
    }
  }

  /**
	 * 
	 * @param address 
	 * Add an empty formGroup built with address template into organization.
	 */
  onAddAddress(address: Address|undefined): void {
    const control = <FormArray>this.organizationForm.controls['address'];
    control.push(this.createAddress(address));
  }

  /**
  * 
  * @param contact 
  * Add an empty formGroup built with contact template into organization.
  */
  onAddContact(contact: Contact|undefined): void {
    const control = <FormArray>this.organizationForm.controls['contact'];
    control.push(this.createContact(contact));
  }

  /**
  * 
  * @param contactIndex 
  * @param phone 
  * Add an empty formGroup built with phone template into contact.
  */
  onAddPhone(contactIndex: number, phone: Phone|undefined): void {
    const control = (<FormArray>this.organizationForm.controls['contact']).at(contactIndex).get('phone') as FormArray;
    control.push(this.createPhone(phone));
  }

  /**
  * 
  * @param contactIndex 
  * @param phone 
  * Add an empty formGroup built with Operation Hour template into operationHour.
  */
   onAddOperationHour(operationHour: OperationHour|undefined): void {
    const control = <FormArray>this.organizationForm.controls['operationHour'];
    control.push(this.createOperationHour(operationHour));
    
  }

  /**
  * 
  * @param holidayHour 
  * Add an empty formGroup built with Statutory Holiday Operation Hour template into statutoryHolidayHour.
  */
  onAddStatutoryHolidayHour(holidayHour: OperationHour|undefined): void {
    const control = <FormArray>this.organizationForm.controls['statutoryHolidayHour'];
    control.push(this.createStatutoryHolidayHour(holidayHour));
  }

  /**
  * 
  * @param charge 
  * Add an empty formGroup built with service Charge template into serviceCharge.
  */
  onAddServiceCharge(charge: ServiceCharge|undefined): void {
    const control = <FormArray>this.organizationForm.controls['serviceCharge'];
    control.push(this.createServiceCharge(charge));
  }

  /**
  * 
  * @param tax 
  * Add an empty formGroup built with Tax template into tax.
  */
  onAddTax(tax: Tax|undefined): void {
    const control = <FormArray>this.organizationForm.controls['tax'];
    control.push(this.createTax(tax));
  }

  /**
  * 
  * @param socialMedia 
  * Add an empty formGroup built with SocialMedia template into socialMedia.
  */
  onAddSocialMedia(socialMedia: SocialMedia|undefined): void {
    const control = <FormArray>this.organizationForm.controls['socialMedia'];
    control.push(this.createSocialMedia(socialMedia));
  }

  /**
	 * 
	 * @param addressIndex 
	 * Remove an address formgroup from address FormArray of a given organizationForm.
	 */
  onRemoveAddress(addressIndex: number): void {
    const control = <FormArray>this.organizationForm.controls['address'];
    control.removeAt(addressIndex);
  }

  /**
  * 
  * @param contactIndex 
  * Remove a contact formgroup from contact FormArray of a given organizationForm.
  */
  onRemoveContact(contactIndex: number): void {
    const control = <FormArray>this.organizationForm.controls['contact'];
    control.removeAt(contactIndex);
  }

  /**
  * 
  * @param contactIndex 
  * @param phoneIndex 
  * Remove a phone formgroup from phone FormArray of a given contact formgroup.
  */
  onRemovePhone(contactIndex: number, phoneIndex: number): void {
    const control = (<FormArray>this.organizationForm.controls['contact']).at(contactIndex).get('phone') as FormArray;
    control.removeAt(phoneIndex);
  }

  /**
  * 
  * @param operationHourIndex 
  * Remove a operationHour formgroup from operationHour FormArray of a given storeForm.
  */
   onRemoveOperationHour(operationHourIndex: number): void {
    const control = <FormArray>this.organizationForm.controls['operationHour'];
    control.removeAt(operationHourIndex);
  }

  /**
  * 
  * @param holidayHourIndex 
  * Remove a statutoryHolidayHour formgroup from statutoryHolidayHour FormArray of a given storeForm.
  */
  onRemoveStatutoryHolidayHour(holidayHourIndex: number): void {
    const control = <FormArray>this.organizationForm.controls['statutoryHolidayHour'];
    control.removeAt(holidayHourIndex);
  }

  /**
  * 
  * @param serviceChargeIndex 
  * Remove a serviceCharge formgroup from serviceCharge FormArray of a given storeForm.
  */
  onRemoveServiceCharge(serviceChargeIndex: number): void {
    const control = <FormArray>this.organizationForm.controls['serviceCharge'];
    control.removeAt(serviceChargeIndex);
  }

  /**
  * 
  * @param taxIndex 
  * Remove a tax formgroup from tax FormArray of a given storeForm.
  */
  onRemoveTax(taxIndex: number): void {
    const control = <FormArray>this.organizationForm.controls['tax'];
    control.removeAt(taxIndex);
  }

  /**
  * 
  * @param taxIndex 
  * Remove a socialMedia formgroup from socialMedia FormArray of a given storeForm.
  */
  onRemoveSocialMedia(socialMediaIndex: number): void {
    const control = <FormArray>this.organizationForm.controls['socialMedia'];
    control.removeAt(socialMediaIndex);
  }

  /**
	 * 
	 * @param event 
	 * @param contactIndex 
	 * This function allows to tag / chips adding like feture to add multiple emails. Here we will tap all keyboard 
	 * entries and the moment user enters space, we would place the whole string in emails array and clear the input box. 
	 */
	onAddEmail(event: MatChipInputEvent, contactIndex: number) {
		if (event.value) {
			let newEmail = this.organizationForm.value.contact[contactIndex].emailInputBox.trim();
			let currentEmails: string[] = this.organizationForm.value.contact[contactIndex].email;

			if(Array.isArray(currentEmails) == false) currentEmails = [];
			currentEmails.push(newEmail);

			this.organizationForm.get('contact.'+contactIndex+'.email')?.setValue(currentEmails);
			this.organizationForm.get('contact.'+contactIndex+'.emailInputBox')?.patchValue('');
		}
	}

  /**
	 * 
	 * @param email 
	 * @param contactIndex 
	 * If a user wants to remove an email, just have to click on email to remove and that will be removed 
	 * from email array of given contact object.
	 */
	onRemoveEmail(email: string, contactIndex: number) {
		let currentEmails: string[] = this.organizationForm.value.contact[contactIndex].email;

		const index = currentEmails.indexOf(email);
		if(index != -1) currentEmails.splice(index, 1);

		this.organizationForm.get('contact.'+contactIndex+'.email')?.setValue(currentEmails);
	}

  // determine organizationType when creating a new organization
  determineOrganizationType(){
    this.subsinks.sink = of(this.localStorageCacheService.getItem('userOrganization'))
    .pipe(
      concatMap( (cachedUserOrganization: Organization) => {
        return this.utilOrganizationService.determineTypeForNewOrganization(cachedUserOrganization);
      })
    )
    .subscribe( (organizationType: string) => {
      this.organizationForm.get('organizationType')?.patchValue(organizationType, { emitEvent: false });
      this.secureLayoutBroadcast.emitPageTitleEvent(this.action+' '+organizationType);
    });
  }

  // fetch organization details to autofill form
  fetchOrganization(){
    this.subsinks.sink = this.organizationService.fetchOrganizationById(this.id)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    ) 
    .subscribe( (organization: Organization) => {
      this.organization = organization;
      this.secureLayoutBroadcast.emitPageTitleEvent(this.action+' '+this.organization.organizationType);
      this.updateOrganizationForm();
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  // fetch drop down options from keyValuePairs
  fetchAllDropDownOptions(){
    this.subsinks.sink = this.keyValuePairService.fetchDropdownOptions(['salutations', 'contactWays', 'contactTypes', 'phoneTypes', 'provinces', 
    'countries', 'businessTypes', 'socialMediaIcons', 'addressTypes', 'days', 'taxes'], this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )       
    .subscribe( (allDropdownOptions: {[key: string]: DropdownOption[]}) => {
      this.dropdownOptions = allDropdownOptions;
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  // update form with organization details and add necessary fields.
  updateOrganizationForm(){
    if(this.organization){

      this.organizationForm.patchValue({ 
				name: this.organization.name,
        businessType: this.organization.businessType,
        website: this.organization.website,
        location: this.organization.location,
        vendorId: this.organization.vendorId,
        organizationType: this.organization.organizationType,
        onlineOrder: this.organization.onlineOrder,
        isActive: this.organization.isActive,
        isDeleted: this.organization.isDeleted,
        isOpened: this.organization.isOpened,
        createDatetime: this.organization.createDatetime 
			});

			for(let i = 0, length = this.organization.address.length; i < length; i++){
				this.onAddAddress(this.organization.address[i]);
			}

			for(let i = 0, len = this.organization.contact.length; i < len; i++){
				this.onAddContact(this.organization.contact[i]);

				for(let j = 0, len = this.organization.contact[i].phone.length; j < len; j++){
					this.onAddPhone(i, this.organization.contact[i].phone[j]);
				}
			}
      
      for(let i = 0, length = this.organization.socialMedia.length; i < length; i++){
				this.onAddSocialMedia(this.organization.socialMedia[i]);
			}

      for(let i = 0, length = this.organization.operationHour.length; i < length; i++){
				this.onAddOperationHour(this.organization.operationHour[i]);
			}

      for(let i = 0, length = this.organization.statutoryHolidayHour.length; i < length; i++){
				this.onAddStatutoryHolidayHour(this.organization.statutoryHolidayHour[i]);
			}

      for(let i = 0, length = this.organization.tax.length; i < length; i++){
				this.onAddTax(this.organization.tax[i]);
			}

      for(let i = 0, length = this.organization.serviceCharge.length; i < length; i++){
				this.onAddServiceCharge(this.organization.serviceCharge[i]);
			}
			
		}
  }

  // Save all the changes made to organization details.
  onSubmit(){
    if(this.organizationForm.valid){
      this.isSaving = true;
		  let organizationObj = this.organizationForm.value;

      for(let i = 0, len = organizationObj.contact.length; i < len; i++){
        delete organizationObj.contact[i].emailInputBox
      }

      const creatingOrganization = of(this.id).pipe(
        filter( () => this.id == 'none'),
        concatMap( () => this.organizationService.createOrganization(this.organizationForm.value, this.organizationId))
      );

      const updatingOrganization = of(this.id).pipe(
        filter( () => this.id != 'none'),
        tap( () => {
          delete organizationObj.menu;
          delete organizationObj.storage;
        }),
        concatMap( (id: string) => {
          return this.organizationService.patchOrganization(this.id, organizationObj, this.organizationId)
        })
      );

      this.subsinks.sink = concat(creatingOrganization, updatingOrganization) 
      .pipe(
        catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
      )     
      .subscribe( (org: Organization | null) => { 
        this.isSaving = false;
        this.router.navigate(['organization/list', this.organizationId])
      },(appropriateError: {msg: string, status: number}) => {
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
