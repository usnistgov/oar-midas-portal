import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal, WritableSignal, Component, Type } from '@angular/core';
import { of } from 'rxjs';
import { DmpTableComponent } from './dmp-table.component';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../../services/credentials.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DataService } from '../../../services/data.service';
import { Widget, Dmp } from '../../../models/dashboard';
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
            dmps: signal([]),
            myDmps: signal([]),
            getDmps: jasmine.createSpy('getDmps').and.returnValue(of([])),
            setDmps: jasmine.createSpy('setDmps'),
            resolveApiUrl: jasmine.createSpy('resolveApiUrl').and.returnValue('http://mock-api/'),
            dmpUI: 'http://mock-dmp-ui/'
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

  const mockDmp = (id: string, modifiedDate: Date): Dmp => ({
    id,
    name: `DMP ${id}`,
    owner: 'testUser',
    primaryContact: 'John Doe',
    modifiedDate,
    organizationUnit: 'Test Org',
    type: 'research',
    status: 'active',
    hasPublication: false,
    keywords: []
  });

  it('length reflects myDmps() count, not dmps() count', () => {
    const dataService = TestBed.inject(DataService) as any;
    (dataService.myDmps as WritableSignal<Dmp[]>).set([mockDmp('1', new Date())]);
    fixture.detectChanges();
    expect(component.length()).toBe(1);
  });

  it('length is 0 when myDmps() is empty', () => {
    expect(component.length()).toBe(0);
  });

  it('dataSource.data is populated from myDmps()', () => {
    const dataService = TestBed.inject(DataService) as any;
    const records = [
      mockDmp('dmp-1', new Date('2025-06-01')),
      mockDmp('dmp-2', new Date('2024-01-01'))
    ];
    (dataService.myDmps as WritableSignal<Dmp[]>).set(records);
    fixture.detectChanges();
    expect(component.dataSource.data).toEqual(records);
  });

  it('dataSource.data preserves the order from myDmps() (newest-first)', () => {
    const dataService = TestBed.inject(DataService) as any;
    const newer = mockDmp('dmp-new', new Date('2025-01-01'));
    const older = mockDmp('dmp-old', new Date('2023-01-01'));
    (dataService.myDmps as WritableSignal<Dmp[]>).set([newer, older]);
    fixture.detectChanges();
    expect(component.dataSource.data[0].id).toBe('dmp-new');
    expect(component.dataSource.data[1].id).toBe('dmp-old');
  });
});
