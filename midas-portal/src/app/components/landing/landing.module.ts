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

import { PanelModule } from "primeng/panel";
import { AccordionModule} from 'primeng/accordion';     //accordion and accordion tab
import { MenuModule} from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarModule } from 'primeng/sidebar';
import { TagModule } from 'primeng/tag';

import {TableModule} from 'primeng/table';

@NgModule({
    declarations:[
        LandingComponent,
        EdiListComponent,
        RecordsComponent,
        DmpListComponent,
        ReviewListComponent,
        FileListComponent,
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
         SidebarModule
         
         
    ],
    providers:[ HttpClient,
        { provide: AuthService, useFactory: createAuthService, deps: [ HttpClient ] }
]
})
export class LandingModule {}