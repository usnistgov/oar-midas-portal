import { NgModule } from '@angular/core';
import { LandingComponent } from './landing.component';
import { provideHttpClient, withInterceptorsFromDi }   from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { AngularMaterialModule } from '../../angular-material.module';
import { DapComponent } from '../tables/dap/dap.component';
import { DmpListComponent } from '../tables/dmp-list/dmp-list.component';
import { ReviewListComponent } from '../tables/review-list/review-list.component';
import { FileListComponent } from '../tables/file-list/file-list.component';
import { ToastModule } from 'primeng/toast';
import { BrowserModule } from '@angular/platform-browser';
import { PanelModule } from "primeng/panel";
import { AccordionModule} from 'primeng/accordion';     //accordion and accordion tab
import { MenuModule} from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarModule } from 'primeng/sidebar';
import { TagModule } from 'primeng/tag';
import {TableModule} from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DapModalComponent } from '../modals/dap/dap.component';
import { FileListModalComponent } from '../modals/file-list/file-list.component';
import { DmpListModalComponent } from '../modals/dmp-list/dmp-list.component';
import { ReviewListModalComponent } from '../modals/review-list/review-list.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { SearchListModalComponent } from '../modals/search/search-list.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';

@NgModule({ declarations: [
        LandingComponent,
        DapComponent,
        DmpListComponent,
        ReviewListComponent,
        FileListComponent,
        DapModalComponent,
        FileListModalComponent,
        DmpListModalComponent,
        ReviewListModalComponent,
        SearchListModalComponent
    ], imports: [AngularMaterialModule,
        PanelModule,
        AccordionModule,
        MenuModule,
        ButtonModule,
        RadioButtonModule,
        FontAwesomeModule,
        TableModule,
        TagModule,
        DropdownModule,
        SidebarModule,
        FormsModule,
        ToastModule,
        BrowserModule,
        MultiSelectModule,
        AutoCompleteModule,
        TabViewModule,
        CalendarModule], providers: [HttpClient, DatePipe, provideHttpClient(withInterceptorsFromDi())] })
export class LandingModule {}