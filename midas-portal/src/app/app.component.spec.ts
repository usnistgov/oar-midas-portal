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
  sideNavWidth = jest.fn().mockReturnValue('320px');
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
            getConfig: jest.fn().mockReturnValue({})
          }
        },
        {
          provide: CredentialsService,
          useValue: {
            token: signal(null),
            userId: signal('testUser'),
            setCreds: jest.fn()
          }
        },
        {
          provide: DashboardService,
          useValue: {}
        },
        {
          provide: DataService,
          useValue: {
            loadAll: jest.fn(),
            getUser: jest.fn(),
            resolveApiUrl: jest.fn().mockReturnValue('ws://test'),
            getDmps: jest.fn().mockReturnValue(of([])),
            setDmps: jest.fn(),
            getDaps: jest.fn().mockReturnValue(of([])),
            setDaps: jest.fn(),
            getFiles: jest.fn().mockReturnValue(of([])),
            setFiles: jest.fn()
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            getCredentials: jest.fn().mockReturnValue(of({
              token: 'mock-token',
              userId: 'test-user',
              userAttributes: {}
            }))
          }
        },
        {
          provide: WebSocketService,
          useValue: {
            connect: jest.fn(),
            messages$: jest.fn().mockReturnValue(of({})),
            toDisplay: jest.fn().mockReturnValue('Test message'),
            record_type: jest.fn().mockReturnValue('dmp')
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
