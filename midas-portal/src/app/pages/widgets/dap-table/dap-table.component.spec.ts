import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal, WritableSignal, Component, Type } from '@angular/core';
import { of } from 'rxjs';
import { DapTableComponent } from './dap-table.component';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../../services/credentials.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DataService } from '../../../services/data.service';
import { Widget, Dap } from '../../../models/dashboard';
import { MatIconModule } from '@angular/material/icon';

// Mock component for testing
@Component({
  template: '<div>Mock Content</div>'
})
class MockContentComponent {}

describe('DapTableComponent', () => {
  let component: DapTableComponent;
  let fixture: ComponentFixture<DapTableComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [DapTableComponent, MockContentComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
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
            getConfig: jest.fn().mockReturnValue({})
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
            daps: signal([]),
            myDaps: signal([]),
            getDaps: jest.fn().mockReturnValue([]),
            resolveApiUrl: jest.fn().mockReturnValue('http://mock-api/'),
            dapUI: 'http://mock-dap-ui/'
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DapTableComponent);
    component = fixture.componentInstance;

    // Set the required widget input
    const mockWidget: Widget = {
      id: 1,
      label: 'Test DAP Widget',
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

  it('shareRecords navigates to /share-my-records with type=DAP', () => {
    const router = TestBed.inject(Router);
    const spy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.shareRecords();
    expect(spy).toHaveBeenCalledWith(['/share-my-records'], { queryParams: { type: 'DAP' } });
  });

  const mockDap = (id: string, modifiedDate: Date): Dap => ({
    id,
    name: `DAP ${id}`,
    owner: 'testUser',
    primaryContact: 'test@example.com',
    modifiedDate,
    location: '/test/path'
  });

  it('length reflects myDaps() count, not daps() count', () => {
    const dataService = TestBed.inject(DataService) as any;
    (dataService.myDaps as WritableSignal<Dap[]>).set([mockDap('1', new Date())]);
    fixture.detectChanges();
    expect(component.length()).toBe(1);
  });

  it('length is 0 when myDaps() is empty', () => {
    expect(component.length()).toBe(0);
  });

  it('dataSource.data is populated from myDaps()', () => {
    const dataService = TestBed.inject(DataService) as any;
    const records = [mockDap('dap-1', new Date('2025-03-01'))];
    (dataService.myDaps as WritableSignal<Dap[]>).set(records);
    fixture.detectChanges();
    expect(component.dataSource.data).toEqual(records);
  });

  it('dataSource.data preserves the order from myDaps() (newest-first)', () => {
    const dataService = TestBed.inject(DataService) as any;
    const newer = mockDap('dap-new', new Date('2025-01-01'));
    const older = mockDap('dap-old', new Date('2023-01-01'));
    (dataService.myDaps as WritableSignal<Dap[]>).set([newer, older]);
    fixture.detectChanges();
    expect(component.dataSource.data[0].id).toBe('dap-new');
    expect(component.dataSource.data[1].id).toBe('dap-old');
  });
});
