import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, signal } from '@angular/core';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { ConfigurationService, AuthenticationService } from 'oarng';
import { CredentialsService } from './services/credentials.service';
import { DashboardService } from './services/dashboard.service';
import { DataService } from './services/data.service';
import { WebSocketService } from './services/websocket.service';

// Mock components
@Component({
  selector: 'app-custom-sidenav',
  template: '<div></div>'
})
class MockCustomSidenavComponent {
  sideNavWidth = jasmine.createSpy('sideNavWidth').and.returnValue('320px');
}

@Component({
  selector: 'app-dashboard',
  template: '<div></div>'
})
class MockDashboardComponent {}

@Component({
  selector: 'app-search',
  template: '<div></div>'
})
class MockSearchComponent {}

@Component({
  selector: 'router-outlet',
  template: '<div></div>'
})
class MockRouterOutlet {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockCustomSidenavComponent,
        MockDashboardComponent,
        MockSearchComponent,
        MockRouterOutlet
      ],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        MatSidenavModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: jasmine.createSpy('getConfig').and.returnValue({})
          }
        },
        {
          provide: CredentialsService,
          useValue: {
            token: signal(null),
            userId: signal('testUser'),
            setCreds: jasmine.createSpy('setCreds')
          }
        },
        {
          provide: DashboardService,
          useValue: {}
        },
        {
          provide: DataService,
          useValue: {
            loadAll: jasmine.createSpy('loadAll'),
            getUser: jasmine.createSpy('getUser'),
            resolveApiUrl: jasmine.createSpy('resolveApiUrl').and.returnValue('ws://test'),
            getDmps: jasmine.createSpy('getDmps').and.returnValue(of([])),
            setDmps: jasmine.createSpy('setDmps'),
            getDaps: jasmine.createSpy('getDaps').and.returnValue(of([])),
            setDaps: jasmine.createSpy('setDaps'),
            getFiles: jasmine.createSpy('getFiles').and.returnValue(of([])),
            setFiles: jasmine.createSpy('setFiles')
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            getCredentials: jasmine.createSpy('getCredentials').and.returnValue(of({
              token: 'mock-token',
              userId: 'test-user',
              userAttributes: {}
            }))
          }
        },
        {
          provide: WebSocketService,
          useValue: {
            connect: jasmine.createSpy('connect'),
            messages$: jasmine.createSpy('messages$').and.returnValue(of({})),
            toDisplay: jasmine.createSpy('toDisplay').and.returnValue('Test message'),
            record_type: jasmine.createSpy('record_type').and.returnValue('dmp')
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have title', () => {
    expect(component.title).toBeDefined();
    expect(component.title).toBe('Midas Portal');
  });
});
