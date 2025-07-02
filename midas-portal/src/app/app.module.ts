import { NgModule } from '@angular/core';

import { NgComponentOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomSidenavComponent } from './components/custom-sidenav/custom-sidenav.component';
import { MenuItemComponent } from './components/menu-item/menu-item.component';
import { WidgetOptionsComponent } from './components/widget/widget-options/widget-options.component';
import { WidgetComponent } from './components/widget/widget.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DapTableComponent } from './pages/widgets/dap-table/dap-table.component';
import { DapComponent } from './pages/widgets/dap/dap.component';
import { DmpTableComponent } from './pages/widgets/dmp-table/dmp-table.component';
import { DmpComponent } from './pages/widgets/dmp/dmp.component';
import { FilesTableComponent } from './pages/widgets/files-table/files-table.component';
import { FilesComponent } from './pages/widgets/files/files.component';
import { ReviewsTableComponent } from './pages/widgets/reviews-table/reviews-table.component';
import { ReviewsComponent } from './pages/widgets/reviews/reviews.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { HelpDialogComponent } from './components/help-dialog/help-dialog.component';
import { LoadFilterDialogComponent } from './components/load-filter-dialog/load-filter-dialog.component';
import { MaintenanceNoticeComponent } from './components/maintenance-notice/maintenance-notice.component';
import { SaveFilterDialogComponent } from './components/save-filter-dialog/save-filter-dialog.component';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { ThemeSelectorDialogComponent } from './components/theme-selector-dialog/theme-selector-dialog.component';
import { SearchComponent } from './pages/search/search.component';
import { DashboardService } from './services/dashboard.service';
import { DataService } from './services/data.service';
import { ExportService } from './services/export.service';
import { SearchFilterService } from './services/search-filter.service';
import { FrameModule, OARngModule,CONFIG_URL } from 'oarng';
import { HeaderComponent } from 'oarng';
import { FooterComponent } from 'oarng';

@NgModule({
  declarations: [
    AppComponent,
    CustomSidenavComponent,
    MenuItemComponent,
    DashboardComponent,
    WidgetComponent,
    DmpComponent,
    WidgetOptionsComponent,
    DapComponent,
    ReviewsComponent,
    FilesComponent,
    DmpTableComponent,
    DapTableComponent,
    ReviewsTableComponent,
    FilesTableComponent,
    MaintenanceNoticeComponent,
    SearchComponent,
    HelpDialogComponent,
    SaveFilterDialogComponent,
    LoadFilterDialogComponent,
    SettingsDialogComponent,
    ThemeSelectorDialogComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatInputModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    DragDropModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSliderModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatRadioModule,
    NgComponentOutlet,
    FormsModule,
    OARngModule,
    FrameModule,
    HeaderComponent,
    FooterComponent
    
  ],
  providers: [
    { provide: CONFIG_URL, useValue: "assets/environment.json" },
    provideAnimationsAsync(),
    DashboardService, 
    SearchFilterService, 
    ExportService, 
    DataService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
