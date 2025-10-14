import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal, Component, Type } from '@angular/core';
import { of } from 'rxjs';
import { DmpTableComponent } from './dmp-table.component';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../../services/credentials.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DataService } from '../../../services/data.service';
import { Widget } from '../../../models/dashboard';
import { MatIconModule } from '@angular/material/icon'; // Add this

// Mock component for testing
@Component({
  template: '<div>Mock Content</div>'
})
class MockContentComponent {}

describe('DmpTableComponent', () => {
  let component: DmpTableComponent;
  let fixture: ComponentFixture<DmpTableComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [DmpTableComponent, MockContentComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NoopAnimationsModule,
        MatIconModule
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
            token: signal('mock-token'),
            userId: signal('testUser')
          }
        },
        {
          provide: DashboardService,
          useValue: {}
        },
        {
          provide: DataService,
          useValue: {
            dmps: signal([]), // This is the key signal function the component uses
            getDmps: jasmine.createSpy('getDmps').and.returnValue(of([])),
            setDmps: jasmine.createSpy('setDmps'),
            resolveApiUrl: jasmine.createSpy('resolveApiUrl').and.returnValue('http://mock-api/'),
            dmpUI: 'http://mock-dmp-ui/' // Property used in createDmp() method
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DmpTableComponent);
    component = fixture.componentInstance;
    
    // Set the required widget input
    const mockWidget: Widget = {
      id: 1,
      label: 'Test DMP Widget',
      content: MockContentComponent as Type<unknown>,
      rows: 2
    };
    
    fixture.componentRef.setInput('widget', mockWidget);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
