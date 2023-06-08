import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, WebAuthService ,createAuthService} from '../auth-service/auth.service';
import { LandingComponent } from './landing.component';
import {HttpClientModule}   from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { AngularMaterialModule } from '../../angular-material.module';
import { EdiListComponent } from '../edi-list/edi-list.component';
import { RecordsComponent } from '../records/records.component';
import { DmpListComponent } from '../dmp-list/dmp-list.component';
import { ReviewListComponent } from '../review-list/review-list.component';
import { FileListComponent } from '../file-list/file-list.component';
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
import { RecordsExtComponent } from '../ext/records/records-ext.component';

@NgModule({
    declarations:[
        LandingComponent,
        EdiListComponent,
        RecordsComponent,
        DmpListComponent,
        ReviewListComponent,
        FileListComponent,
        RecordsExtComponent
    ],
    imports:[
         HttpClientModule,
         AngularMaterialModule,
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
         BrowserModule
         
         
    ],
    providers:[ HttpClient,
        { provide: AuthService, useFactory: createAuthService, deps: [ HttpClient ] },DatePipe
]
})
export class LandingModule {}