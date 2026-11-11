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
            validateSelection: jest.fn().mockReturnValue(true),
            downloadRecords: jest.fn().mockReturnValue(of(null))
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


  // Download sends whatever is ticked, and refreshing the results rebuilds every
  // record as a new object — so a selection keyed on identity sends the wrong set.
  describe('selection survives a results refresh', () => {
    const rowsFor = (ids: string[], type = 'dmp') =>
      ids.map(id => ({ id, name: `Record ${id}`, owner: 'o', type } as any));

    const showResults = (ids: string[], daps: string[] = []) => {
      const ds = TestBed.inject(DataService) as any;
      ds.dmps.set(rowsFor(ids));
      ds.daps.set(rowsFor(daps, 'dap'));
      fixture.detectChanges();          // the effect drives updateDataSource, as in the app
    };

    const sentToDownload = () => {
      const download = TestBed.inject(DownloadService) as any;
      component.downloadData('json');
      return download.downloadRecords.mock.calls.at(-1)![0];
    };

    beforeEach(() => showResults(['a', 'b', 'c']));

    it('keeps a row ticked when the records are refetched', () => {
      component.selection.select(component.dataSource.data[0]);
      showResults(['a', 'b', 'c']);     // same records, new objects
      expect(component.selection.isSelected(component.dataSource.data[0])).toBe(true);
    });

    it('sends a record once when it is ticked either side of a refresh', () => {
      component.selection.select(component.dataSource.data[0]);
      showResults(['a', 'b', 'c']);
      component.selection.select(component.dataSource.data[0]);

      expect(sentToDownload().map((r: any) => r.id)).toEqual(['a']);
    });

    it('sends the record as the table holds it now, not as it was ticked', () => {
      component.selection.select(component.dataSource.data[0]);
      const ds = TestBed.inject(DataService) as any;
      ds.dmps.set([{ id: 'a', name: 'Renamed', owner: 'o', type: 'dmp' } as any]);
      ds.daps.set([]);
      fixture.detectChanges();

      expect(sentToDownload()[0].name).toBe('Renamed');
    });

    // the fallback records bundled with the app reuse one set of ids across both
    it('does not treat a dap as the dmp of the same id', () => {
      showResults(['a'], ['a']);

      const dmpRow = component.dataSource.data.find((r: any) => r.type === 'dmp')!;
      component.selection.select(dmpRow);

      const dapRow = component.dataSource.data.find((r: any) => r.type === 'dap')!;
      expect(component.selection.isSelected(dapRow)).toBe(false);
      expect(component.isAllSelected()).toBe(false);
    });

    it('does not call an empty table fully selected', () => {
      showResults([]);
      expect(component.isAllSelected()).toBe(false);
      expect(component.isPartlySelected()).toBe(false);
    });
  });

  // Nothing on this page shows a selected record that is not in the table, so one
  // left behind would be invisible until Download sent it.
  describe('when the results no longer hold a selected record', () => {
    const rowsFor = (ids: string[]) =>
      ids.map(id => ({ id, name: `Record ${id}`, owner: 'o', type: 'dmp' } as any));
    const showResults = (ids: string[]) => {
      const ds = TestBed.inject(DataService) as any;
      ds.dmps.set(rowsFor(ids)); ds.daps.set([]);
      fixture.detectChanges();
    };

    it('forgets it, so the header and Download agree with the table', () => {
      showResults(['a', 'b', 'c']);
      component.toggleAllRows();
      expect(component.isAllSelected()).toBe(true);

      showResults(['a']);

      expect(component.selection.selected.map(r => r.id)).toEqual(['a']);
      expect(component.isAllSelected()).toBe(true);
      expect(component.isPartlySelected()).toBe(false);

      const download = TestBed.inject(DownloadService) as any;
      component.downloadData('json');
      expect(download.downloadRecords.mock.calls.at(-1)![0].map((r: any) => r.id)).toEqual(['a']);
    });

    it('leaves the header unticked rather than mixed when none remain', () => {
      showResults(['a', 'b']);
      component.selection.select(component.dataSource.data[0]);

      showResults(['c']);

      expect(component.selection.selected).toEqual([]);
      expect(component.isAllSelected()).toBe(false);
      expect(component.isPartlySelected()).toBe(false);
    });
  });

  it('should clear filters', () => {
    component.searchTerm = 'test';
    component.clearFilters();
    expect(component.searchTerm).toBe('');
    expect(component.hasFilters()).toBe(false);
  });
});
