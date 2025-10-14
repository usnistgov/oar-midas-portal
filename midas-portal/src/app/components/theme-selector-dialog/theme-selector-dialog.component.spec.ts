import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ThemeSelectorDialogComponent } from './theme-selector-dialog.component';
import { ConfigurationService } from '../../../../../lib/dist/oarng'; // Adjust path
import { CredentialsService } from '../../services/credentials.service'; // Adjust path
import { DashboardService } from '../../services/dashboard.service'; // Adjust path
import { DataService } from '../../services/data.service'; // Adjust path
import { MatRadioModule } from '@angular/material/radio'; 
import { FormsModule } from '@angular/forms';

describe('ThemeSelectorDialogComponent', () => {
  let component: ThemeSelectorDialogComponent;
  let fixture: ComponentFixture<ThemeSelectorDialogComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [ThemeSelectorDialogComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule,
        MatRadioModule,
        FormsModule
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
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close'),
            afterClosed: () => of(true)
          }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ThemeSelectorDialogComponent);
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
