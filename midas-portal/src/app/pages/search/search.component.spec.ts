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
            loadAll: jest.fn().mockReturnValue(of({})),
            getDmps: jest.fn().mockReturnValue(of([])),
            advancedSearch: jest.fn().mockReturnValue(of({
              rows: [
                { id: 'found-1', name: 'Found', owner: 'o', primaryContact: 'c',
                  modifiedDate: new Date(), type: 'dmp', status: 'edit' }
              ],
              failed: []
            })),
            resolveApiUrl: jest.fn().mockReturnValue('http://mock-api/'),
            credsService: {
              token: () => 'mock-token'
            }
          }
        },
        {
          provide: PeopleService,
          useValue: {
            getNISTOrganizations: jest.fn().mockReturnValue(of({})),
            getNISTPersonnel: jest.fn().mockReturnValue(of({}))
          }
        },
        {
          provide: ExportService,
          useValue: {
            exportJSON: jest.fn(),
            exportCSV: jest.fn(),
            exportPDF: jest.fn()
          }
        },
        {
          provide: DownloadService,
          useValue: {
            downloadJSON: jest.fn(),
            downloadCSV: jest.fn(),
            downloadPDF: jest.fn(),
            downloadmarkdown: jest.fn()
          }
        },
        {
          provide: SearchFilterService,
          useValue: {
            buildParts: jest.fn().mockReturnValue([]),
            buildText: jest.fn().mockReturnValue(''),
            filterDmpOrDapList: jest.fn().mockReturnValue([])
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;

    // Prevent ngOnInit from running during setup
    jest.spyOn(component, 'ngOnInit');
    
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

  describe('server-side search', () => {
    let dataService: any;

    beforeEach(() => {
      dataService = TestBed.inject(DataService);
      dataService.advancedSearch.mockClear();
    });

    it('sends a built filter and the collections to search', () => {
      component.searchTerm = 'carbon';
      component.performSearch();

      expect(dataService.advancedSearch).toHaveBeenCalledTimes(1);
      const [filters] = dataService.advancedSearch.mock.calls[0];
      // each collection gets its own filter: the contact name lives in a different field
      expect(Object.keys(filters)).toEqual(['dmp', 'dap']);
      expect(JSON.stringify(filters.dmp)).toContain('carbon');
      expect(JSON.stringify(filters.dmp)).toContain('data.contributors');
      expect(JSON.stringify(filters.dap)).toContain('data.contactPoint.fn');
    });

    it('shows the rows the server returned', () => {
      component.searchTerm = 'carbon';
      component.performSearch();

      expect(component.dataSource.data.map((r: any) => r.id)).toEqual(['found-1']);
      expect(component.length).toBe(1);
    });

    it('drops row selection when the results are replaced', () => {
      component.selection.select(component.dataSource.data[0]);
      expect(component.selection.isEmpty()).toBe(false);

      component.searchTerm = 'carbon';
      component.performSearch();

      // rows are new objects, so a reference-based selection would silently detach
      expect(component.selection.isEmpty()).toBe(true);
    });

    it('does not call the endpoint when no criteria are set', () => {
      component.searchTerm = '';
      component.performSearch();

      expect(dataService.advancedSearch).not.toHaveBeenCalled();
    });

    it('reports a failed collection instead of showing it as no results', () => {
      dataService.advancedSearch.mockReturnValue(of({ rows: [], failed: ['dap'] }));

      component.searchTerm = 'carbon';
      component.performSearch();

      expect(component.searchError).toContain('DAP');
      expect(component.isLoading).toBe(false);
    });

    it('keeps live record updates out of the table while results are shown', () => {
      component.searchTerm = 'carbon';
      component.performSearch();
      expect(component.dataSource.data.map((r: any) => r.id)).toEqual(['found-1']);

      // clearing the filters hands the table back to the listing
      component.clearFilters();
      expect(component.dataSource.data.map((r: any) => r.id)).toEqual(['dmp1', 'dap1']);
    });

  });
});
