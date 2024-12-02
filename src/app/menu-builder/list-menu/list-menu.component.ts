import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { MenuItem } from 'src/app/core/models/menu.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { SubSink } from 'subsink';
import { MenuItemService } from '../repositories/menu-item.service';

@Component({
  selector: 'wx-list-menu',
  templateUrl: './list-menu.component.html',
  styleUrls: ['./list-menu.component.scss']
})
export class ListMenuComponent implements OnInit {

  menuItems: MenuItem[];
  organizationId: string;

  dropdownOptions: {[key: string]: DropdownOption[]} = {salutations: [], contactWays: [], contactTypes: [], phoneTypes: [], provinces: [], countries: [], entityState: []};
  subsinks: SubSink = new SubSink();

  constructor(
    public snackBar: MatSnackBar, private route: ActivatedRoute,
    private interpretServerErrorService: InterpretServerErrorService,
    private localStorageCacheService: LocalStorageCacheService,
    private secureLayoutBroadcast: SecureLayoutService,
    private menuItemService: MenuItemService
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';

    this.fetchMenuItems();
  }

  // fetch all menus regardless of their status
  fetchMenuItems(){
    this.subsinks.sink = this.menuItemService.fetchMenuItem(this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    ) 
    .subscribe( (items: MenuItem[]) => {
      this.menuItems = items;
    }, (appropriateError: {msg: string, status: number}) => {
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
