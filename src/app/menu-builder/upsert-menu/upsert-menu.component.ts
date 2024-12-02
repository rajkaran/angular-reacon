import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';

import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { MenuItemService } from '../repositories/menu-item.service';
import { MenuItem } from 'src/app/core/models/menu.model';
import { catchError, concatMap, filter } from 'rxjs/operators';
import { concat, of, throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'wx-upsert-menu',
  templateUrl: './upsert-menu.component.html',
  styleUrls: ['./upsert-menu.component.scss']
})
export class UpsertMenuComponent implements OnInit {

  id: string;
  menuItemForm: FormGroup;
  menuItem: MenuItem;
  organizationId: string;

  action: string = 'Create';
  dropdownOptions: {[key: string]: DropdownOption[]} = {salutations: [], contactWays: [], contactTypes: [], phoneTypes: [], provinces: [], countries: [], entityState: []};
  isSaving: boolean = false;
  subsinks: SubSink = new SubSink();

  constructor(
    public snackBar: MatSnackBar, private route: ActivatedRoute,
    private formBuilder: FormBuilder, private router: Router,
    private interpretServerErrorService: InterpretServerErrorService,
    private localStorageCacheService: LocalStorageCacheService,
    private secureLayoutBroadcast: SecureLayoutService,
    private menuItemService: MenuItemService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id") || 'none';
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';
    
    if(this.id != 'none'){
      this.fetchMenuItem();
      this.action = 'Edit';
    }
    else{
      this.secureLayoutBroadcast.emitPageTitleEvent(this.action+' Menu Item');
    }

		this.initMenuItemForm();
  }

  // initialize menu item form
  initMenuItemForm(){
    this.menuItemForm = this.formBuilder.group({
      name: [''],
      alias: [''],
      department: [''],
      price: [''],
      displayName: [''],
      description: [''],
      notes: [''],
      limitedTimeOnly: this.formBuilder.array([]),
      comboItem: [false],
      reqComboItem: this.formBuilder.array([]),
      replaceable: [false],
      replaceWith: this.formBuilder.array([]),
      misc: this.formBuilder.array([]),
      pos: [''],
      xTaxes: this.formBuilder.array([]),
      customerEditable: [false],
      canUseCoupons: [false],
      canUseRewards: [false],
      special: [false],
      onSale: [false],
      new: [false],
      referenced: [false],
      isActive: [true],
      organizationId: [this.organizationId],
      createDatetime: [new Date()]   
		});
  }

  // fetch menu item by an id
  fetchMenuItem(){
    this.subsinks.sink = this.menuItemService.fetchMenuItemById(this.organizationId, this.id)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (item: MenuItem) => {
      this.menuItem = item;
      this.updateMenuItemForm();
      this.secureLayoutBroadcast.emitPageTitleEvent(this.action+' '+this.menuItem.name);
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  // update form with organization details and add necessary fields.
  updateMenuItemForm(){
    if(this.menuItem){
      this.menuItemForm.patchValue({
        name: this.menuItem.name,
        alias: this.menuItem.alias,
        department: this.menuItem.department,
        price: this.menuItem.price,
        displayName: this.menuItem.displayName,
        description: this.menuItem.description,
        notes: this.menuItem.notes,
        limitedTimeOnly: this.menuItem.limitedTimeOnly,
        comboItem: this.menuItem.comboItem,
        reqComboItem: this.menuItem.reqComboItem,
        replaceable: this.menuItem.replaceable,
        replaceWith: this.menuItem.replaceWith,
        misc: this.menuItem.misc,
        pos: this.menuItem.pos,
        xTaxes: this.menuItem.xTaxes,
        customerEditable: this.menuItem.customerEditable,
        canUseCoupons: this.menuItem.canUseCoupons,
        canUseRewards: this.menuItem.canUseRewards,
        special: this.menuItem.special,
        onSale: this.menuItem.onSale,
        new: this.menuItem.new,
        referenced: this.menuItem.referenced,
        isActive: this.menuItem.isActive,
        organizationId: this.menuItem.organizationId,
        createDatetime: this.menuItem.createDatetime
      });
    }
  }

  // This function persists the changes by creating a new menu item or editing an existing one.
  onSubmit(){
    if(!this.menuItemForm.valid) return;

    this.isSaving = true;

    const createObservable = of(this.id)
    .pipe(
      filter( (id: string) => id === 'none'),
      concatMap( (id: string) => {
        return this.menuItemService.createMenuItem(this.menuItemForm.value, this.organizationId)
      })
    );

    const editObservable = of(this.id)
    .pipe(
      filter( (id: string) => id !== 'none'),
      concatMap( (id: string) => {
        return this.menuItemService.patchMenuItem(this.id, this.menuItemForm.value, this.organizationId)
      })
    );

    this.subsinks.sink = concat(createObservable, editObservable)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (item: MenuItem | null) => {
      this.router.navigate(['/menu/list/', this.organizationId]);

      this.isSaving = false;
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
