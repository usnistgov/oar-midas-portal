import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, WebAuthService ,createAuthService} from '../auth-service/auth.service';
import { LandingComponent } from './landing.component';
import {HttpClientModule}   from '@angular/common/http';
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

@NgModule({
    declarations:[
        LandingComponent,
        DapComponent,
        DmpListComponent,
        ReviewListComponent,
        FileListComponent,
        DapModalComponent,
        FileListModalComponent,
        DmpListModalComponent,
        ReviewListModalComponent
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