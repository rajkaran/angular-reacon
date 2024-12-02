import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDividerModule} from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatChipsModule} from '@angular/material/chips';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRippleModule} from '@angular/material/core';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ClipboardModule} from '@angular/cdk/clipboard';

@NgModule({
  declarations: [],
  imports: [
    CommonModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatIconModule, MatToolbarModule,
    MatDividerModule, MatMenuModule, MatSelectModule, MatChipsModule, MatSlideToggleModule, MatSidenavModule, MatListModule, OverlayModule,
    MatProgressBarModule, MatDialogModule, MatTooltipModule, MatAutocompleteModule, MatExpansionModule, MatDatepickerModule, MatNativeDateModule,
    MatBottomSheetModule, MatProgressSpinnerModule, MatRippleModule, MatTabsModule, MatCheckboxModule, DragDropModule, ClipboardModule
  ],
  exports: [
    MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatIconModule, MatToolbarModule,
    MatDividerModule, MatMenuModule, MatSelectModule, MatChipsModule, MatSlideToggleModule, MatSidenavModule, MatListModule, OverlayModule,
    MatProgressBarModule, MatDialogModule, MatTooltipModule, MatAutocompleteModule, MatExpansionModule, MatDatepickerModule, MatNativeDateModule,
    MatBottomSheetModule, MatProgressSpinnerModule, MatRippleModule, MatTabsModule, MatCheckboxModule, DragDropModule, ClipboardModule
  ]
})
export class MaterialModule { }
