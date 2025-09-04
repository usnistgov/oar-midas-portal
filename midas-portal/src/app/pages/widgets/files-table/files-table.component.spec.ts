import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal, Component, Type } from '@angular/core';
import { of } from 'rxjs';
import { FilesTableComponent } from './files-table.component';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../../services/credentials.service';
import { DashboardService } from '../../../services/dashboard.service';
import { DataService } from '../../../services/data.service';
import { Widget } from '../../../models/dashboard';

// Mock component for widget content
@Component({
  template: '<div>Mock Files Table</div>'
})
class MockFilesTableContentComponent {}

describe('FilesTableComponent', () => {
  let component: FilesTableComponent;
  let fixture: ComponentFixture<FilesTableComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [FilesTableComponent, MockFilesTableContentComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
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
            files: signal([
              {
                id: 'file1',
                name: 'Test File.pdf',
                usage: 'Public',
                fileCount: 1,
                modifiedDate: new Date(),
                location: '/test/file.pdf'
              }
            ]),
            getFiles: jasmine.createSpy('getFiles').and.returnValue(of([])),
            resolveApiUrl: jasmine.createSpy('resolveApiUrl').and.returnValue('http://mock-api/'),
            nextcloudUI: 'http://mock-nextcloud/'
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FilesTableComponent);
    component = fixture.componentInstance;
    
    // Set the required widget input
    const mockWidget: Widget = {
      id: 1,
      label: 'Files Table Widget',
      content: MockFilesTableContentComponent as Type<unknown>,
      rows: 2,
      columns: 1
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

  it('should initialize with correct columns', () => {
    expect(component.displayedColumns).toEqual(['name', 'usage', 'fileCount', 'modifiedDate']);
  });

  it('should toggle column visibility', () => {
    const initialSize = component.displayedColumns.length;
    component.toggleColumn('name', false);
    expect(component.displayedColumns.length).toBe(initialSize - 1);
    
    component.toggleColumn('name', true);
    expect(component.displayedColumns.length).toBe(initialSize);
  });

  it('should calculate page size based on widget rows', () => {
    expect(component.pageSize).toBeGreaterThan(0);
  });

  it('should apply filter to data source', () => {
    const mockEvent = {
      target: { value: 'test' }
    } as any;
    
    component.applyFilter(mockEvent);
    expect(component.dataSource.filter).toBe('test');
  });
});
