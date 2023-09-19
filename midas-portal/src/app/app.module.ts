import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { LandingComponent } from './components/landing/landing.component';
// import { EdiListComponent } from './components/edi-list/edi-list.component';
// import { RecordsComponent } from './components/records/records.component';
// import { DmpListComponent } from './components/dmp-list/dmp-list.component';
// import { ReviewListComponent } from './components/review-list/review-list.component';
// import { FileListComponent } from './components/file-list/file-list.component';
import { OARngModule } from 'oarng';
import { FrameModule } from 'oarng';
import { AuthModule } from 'oarng';
import { CONFIG_URL } from 'oarng';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from "primeng/panel";
import {ScrollPanelModule} from 'primeng/scrollpanel';
import { HttpClientModule } from '@angular/common/http';
// import { AuthService, WebAuthService, CustomizationService } from './components/auth-service/auth.service';
// import { LandingComponent } from './components/landing/landing.component';
import { LandingModule } from './components/landing/landing.module';
import { fakeBackendProvider } from './_helpers/fakeBackendInterceptor';



@NgModule({
  declarations: [
    AppComponent,
    LogInComponent
    // LandingComponent,
    // EdiListComponent,
    // RecordsComponent,
    // DmpListComponent,
    // ReviewListComponent,
    // FileListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    OARngModule,
    FrameModule,
    HttpClientModule,
    LandingModule,
    ScrollPanelModule,
    DropdownModule,
    AuthModule
  ],
  providers: [
//       fakeBackendProvider,
      { provide: CONFIG_URL, useValue: "assets/environment.json" },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
