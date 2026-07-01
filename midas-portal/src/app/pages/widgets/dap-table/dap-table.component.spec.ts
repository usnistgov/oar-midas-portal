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
import { signal, Component, Type } from '@angular/core';
import { DapTableComponent } from './dap-table.component';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../../services/credentials.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DataService } from '../../../services/data.service';
import { Widget } from '../../../models/dashboard';
import { MatIconModule } from '@angular/material/icon';

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

    const mockWidget: Widget = {
      id: 2,
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
});
