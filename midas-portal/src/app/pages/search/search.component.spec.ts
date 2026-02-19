import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { SearchComponent } from './search.component';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../services/credentials.service';
import { DashboardService } from '../../services/dashboard.service';
import { DataService } from '../../services/data.service';
import { PeopleService } from '../../services/people.service';
import { ExportService } from '../../services/export.service';
import { DownloadService } from '../../services/download.service';
import { SearchFilterService } from '../../services/search-filter.service';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatInputModule,
        MatFormFieldModule,
        MatChipsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatExpansionModule,
        DragDropModule,
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
            dmps: signal([
              {
                id: 'dmp1',
                name: 'Test DMP',
                owner: 'Test Owner',
                primaryContact: 'Test Contact',
                modifiedDate: new Date(),
                type: 'dmp',
                status: 'published'
              }
            ]),
            daps: signal([
              {
                id: 'dap1',
                name: 'Test DAP',
                owner: 'Test Owner',
                primaryContact: 'Test Contact',
                modifiedDate: new Date(),
                type: 'dap'
              }
            ]),
            loadAll: jasmine.createSpy('loadAll').and.returnValue(of({})),
            getDmps: jasmine.createSpy('getDmps').and.returnValue(of([])),
            resolveApiUrl: jasmine.createSpy('resolveApiUrl').and.returnValue('http://mock-api/'),
            credsService: {
              token: () => 'mock-token'
            }
          }
        },
        {
          provide: PeopleService,
          useValue: {
            getNISTOrganizations: jasmine.createSpy('getNISTOrganizations').and.returnValue(of({})),
            getNISTPersonnel: jasmine.createSpy('getNISTPersonnel').and.returnValue(of({}))
          }
        },
        {
          provide: ExportService,
          useValue: {
            exportJSON: jasmine.createSpy('exportJSON'),
            exportCSV: jasmine.createSpy('exportCSV'),
            exportPDF: jasmine.createSpy('exportPDF')
          }
        },
        {
          provide: DownloadService,
          useValue: {
            downloadJSON: jasmine.createSpy('downloadJSON'),
            downloadCSV: jasmine.createSpy('downloadCSV'),
            downloadPDF: jasmine.createSpy('downloadPDF'),
            downloadmarkdown: jasmine.createSpy('downloadmarkdown')
          }
        },
        {
          provide: SearchFilterService,
          useValue: {
            buildParts: jasmine.createSpy('buildParts').and.returnValue([]),
            buildText: jasmine.createSpy('buildText').and.returnValue(''),
            filterDmpOrDapList: jasmine.createSpy('filterDmpOrDapList').and.returnValue([])
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;

    // Prevent ngOnInit from running during setup
    spyOn(component, 'ngOnInit');
    
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle column visibility', () => {
    const initialSize = component.displayedColumns.length;
    component.toggleColumn('name', false);
    expect(component.displayedColumns.length).toBe(initialSize - 1);
    
    component.toggleColumn('name', true);
    expect(component.displayedColumns.length).toBe(initialSize);
  });

  it('should clear filters', () => {
    component.searchTerm = 'test';
    component.clearFilters();
    expect(component.searchTerm).toBe('');
    expect(component.hasFilters()).toBe(false);
  });
});
