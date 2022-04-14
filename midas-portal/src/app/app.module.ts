import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LandingComponent } from './components/landing/landing.component';
import { EdiListComponent } from './components/edi-list/edi-list.component';
import { RecordsComponent } from './components/records/records.component';
import { DmpListComponent } from './components/dmp-list/dmp-list.component';
import { FooterComponent } from './components/footer/footer.component';
import { ReviewComponent } from './components/review/review.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { FileManagerComponent } from './components/file-manager/file-manager.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EdiListModal } from './components/edi-list/edi-list-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    LandingComponent,
    EdiListComponent,
    RecordsComponent,
    DmpListComponent,
    FooterComponent,
    ReviewComponent,
    DocumentationComponent,
    FileManagerComponent,
    SearchBarComponent,
    EdiListModal
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
