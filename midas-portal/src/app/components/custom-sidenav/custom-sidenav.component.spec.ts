import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { CustomSidenavComponent } from './custom-sidenav.component';
import { ConfigurationService, AuthenticationService } from 'oarng';
import { CredentialsService } from '../../services/credentials.service';
import { DashboardService } from '../../services/dashboard.service';
import { DataService } from '../../services/data.service';

describe('CustomSidenavComponent', () => {
  let component: CustomSidenavComponent;
  let fixture: ComponentFixture<CustomSidenavComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [CustomSidenavComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
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
            userId: signal('testUser')
          }
        },
        {
          provide: DashboardService,
          useValue: {}
        },
        {
          provide: DataService,
          useValue: {}
        },
        {
          provide: AuthenticationService, // Add this
          useValue: {
            getCredentials: jasmine.createSpy('getCredentials').and.returnValue(of({
              token: 'mock-token',
              userId: 'test-user'
            }))
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CustomSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
