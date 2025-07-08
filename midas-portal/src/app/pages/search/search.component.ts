import {
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewChild
} from '@angular/core';
import {
  MatChipEditedEvent,
  MatChipInputEvent
} from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, startWith, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../components/help-dialog/help-dialog.component';
import { SaveFilterDialogComponent } from '../../components/save-filter-dialog/save-filter-dialog.component';
import { LoadFilterDialogComponent } from '../../components/load-filter-dialog/load-filter-dialog.component';
import { FormControl } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ExportService } from '../../services/export.service';
import { DataService } from '../../services/data.service';
import { PeopleService } from '../../services/people.service';
import { FilterCriteria, SearchFilterService } from '../../services/search-filter.service';



export interface Dmp {
  id: string;
  name: string;
  owner: string;
  primaryContact: string;
  modifiedDate: Date;
  type?: string | undefined;
  status?: string | undefined;
  hasPublication?: boolean;
  organizationUnit?: string;
  keywords?: string[];
}

export interface Dap {
  id: string;
  name: string;
  owner: string;
  type?: string | undefined;
  primaryContact: string;
  modifiedDate: Date;
}


type DmpOrDap = Dmp | Dap;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  /** Key codes for MatChipInput (ENTER, COMMA) */
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  /** Whether to add chip on blur */
  readonly addOnBlur = true;
  
  // inject snackabars and dialogs
  private _snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  /** Whether data or filters are currently loading */
  isLoading = false;
  /** flag indicating if user hit search. TODO: make this a signal? */
  searchPerformed = false;
  /** Controls visibility of the export menu */
  menuOpened = signal(false);
  /** Whether any filters are active */
  hasFilters = signal(false);
  /** Raw search term typed by the user */
  searchTerm = '';
  /** Number of filters currently applied */
  activeFilterCount = computed(() => this.filterParts().length);
  /** All keywords available (signal for reactivity) */
  keywords = signal<string[]>([]);
  /** Chips that have been typed but not yet applied */
  pendingKeywords: string[] = [];
  /** Chips currently applied as filters */
  activeKeywords = signal<string[]>([]);
  /** Selected Org Unit (two-way bound) */
  selectedOrgUnit?: string;
  /** Mat-FormControl for org-unit autocomplete */
  orgUnitControl = new FormControl<string>('', { nonNullable: true });
  /** Options filtered as user types for org-unit */
  filteredOrgUnits!: Observable<string[]>;
  /** Mat-FormControl for owner autocomplete */
  ownerControl = new FormControl<string>('', { nonNullable: true });
  /** Options filtered as user types for owner */
  filteredOwners!: Observable<string[]>;
  orgIndex: any[] | null = null;         // Cached orgs
  orgSuggestions: string[] = [];  
  peopleIndex: { id: string, fullName: string, lastName: string, firstName: string }[] | null = null;  // Cached people
  peopleSuggestions: string[] = [];   
  
    
  /** Available resource types (for chip list) */
  resourceTypes = ['DMP', 'DAP'];
  /** Fixed list of status options */
  statuses = [
    { label: 'Published', value: 'published' },
    { label: 'Edit', value: 'edit' },
    { label: 'Reviewed', value: 'reviewed' }
  ];
  /** Selected resource types */
  selectedResourceTypes: string[] = [];
  /** ChipControl for resource-types */
  resourceTypeControl = new FormControl<string[]>([], { nonNullable: true });
  /** ChipControl for statuses */
  statusControl = new FormControl<string[]>([], { nonNullable: true });
  /** Whether the “Has Publication” checkbox is checked */
  hasPaperPublication = false;
  /** Mode: 'exact' | 'before' | 'after' | 'between' */
  dateFilterType: 'exact' | 'before' | 'after' | 'between' = 'between';
  /** Date range for “between” */
  dateRange = { start: null as Date | null, end: null as Date | null };
  /** Single dates for other modes */
  exactDate?: Date;
  beforeDate?: Date;
  afterDate?: Date;

  filterParts = computed(() => {
    const crit: FilterCriteria = this.currentCriteria();
    return this.filterService.buildParts(crit);
  });

  filterSummary = computed(() => {
    const crit: FilterCriteria = this.currentCriteria();
    return this.filterService.buildText(crit);
  });

  /** Helper to bundle up all your component’s fields into one object */
  private currentCriteria(): FilterCriteria {
    return {
      query: this.searchTerm,
      keywords: this.activeKeywords(),
      orgUnit: this.orgUnitControl.value,
      owner: this.ownerControl.value,
      types: this.resourceTypeControl.value,
      statuses: this.statusControl.value,
      hasPublication: this.hasPaperPublication,
      dateFilterType: this.dateFilterType,
      exactDate: this.exactDate,
      beforeDate: this.beforeDate,
      afterDate: this.afterDate,
      rangeStart: this.dateRange.start,
      rangeEnd: this.dateRange.end,
    };
  }



  
  dataSource = new MatTableDataSource<DmpOrDap>([]);

  /** Master list of table columns */
  allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'owner', label: 'Owner' },
    { key: 'primaryContact', label: 'Primary Contact' },
    { key: 'organizationUnit', label: 'Org Unit' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'modifiedDate', label: 'Last Modified' },
    { key: 'actions', label: 'Actions' }
  ];

  readonly allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumnSet = new Set<string>(this.allColumnKeys);

  /** which columns are currently visible */
  get displayedColumns(): string[] {
    return this.allColumnKeys.filter(key => this.displayedColumnSet.has(key));
  }

  /**
   * Called when a user toggles a column checkbox.
   * Adds/removes the key from displayedColumns.
   */
  toggleColumn(key: string, on: boolean) {
    if (on) {
      this.displayedColumnSet.add(key);
    } else {
      this.displayedColumnSet.delete(key);
    }
  }

  /** called when the user drops a header */
  dropColumn(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.displayedColumns,
      event.previousIndex,
      event.currentIndex
    );
  }

  viewData(dmp: Dmp) {
    console.log('DMP record:', dmp);
    // Optionally show a SnackBar telling the user:
    this._snackBar.open('Record JSON logged to console', 'Dismiss', {
      duration: 2000
    });
  }


  // Load the saved config object once
  private config: Record<string, { label: string; value: string }> =
    JSON.parse(localStorage.getItem('appConfig') || '{}');

  // Compute base URLs, falling back if not set
  get dmpEDIT(): string {
    return this.config['dmpEDIT']?.value
  }

  get dapEDIT(): string {
    return this.config['dapEDIT']?.value
  }


  length = computed(() => this.dataSource.data.length);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient,
    private dataService: DataService,
    private peopleService: PeopleService,
    private exportService: ExportService,
    private filterService: SearchFilterService) {
    this.dataSource.filterPredicate = (d: Dmp, filter: string) =>
      d.name.toLowerCase().includes(filter) ||
      d.owner.toLowerCase().includes(filter) ||
      d.primaryContact.toLowerCase().includes(filter);
    effect(() => {
      this.updateDataSource();
    });
  }

  getOrgs(queryString: string): void {
  if (queryString.length < 2) {
    this.orgSuggestions = [];
    this.orgIndex = null;
    return;
  }
  // Always fetch for each query
  this.peopleService.getNISTOrganizations(queryString.toUpperCase())
    .subscribe((rawOrgs: { [key: string]: any }) => {
      const flatOrgs: { id: string, name: string, key: string }[] = [];
      Object.keys(rawOrgs).forEach(orgKey => {
        const orgObj = rawOrgs[orgKey];
        Object.keys(orgObj).forEach(id => {
          flatOrgs.push({
            id,
            name: orgObj[id],
            key: orgKey
          });
        });
      });
      this.orgIndex = flatOrgs;
      this.searchOrgIndex(queryString);
    });
}

searchOrgIndex(queryString: string): void {
  if (!this.orgIndex) return;
  const q = queryString.toLowerCase();
  this.orgSuggestions = this.orgIndex
    .filter(org =>
      org.name.toLowerCase().includes(q) ||
      org.key.toLowerCase().includes(q)
    )
    .map(org => org.name)
    .filter(Boolean)
    .sort();
}

    getPeople(queryString: string): void {
  if (queryString.length < 2) {
    this.peopleSuggestions = [];
    this.peopleIndex = null;
    return;
  }
  // Always fetch for each query
  this.peopleService.getNISTPersonnel(queryString.toUpperCase())
  .subscribe((rawPeople: { [key: string]: any }) => {
    const flatPeople: { id: string, fullName: string, lastName: string, firstName: string }[] = [];
    Object.keys(rawPeople).forEach(lastNameKey => {
      const peopleObj = rawPeople[lastNameKey];
      Object.keys(peopleObj).forEach(id => {
        const fullName = peopleObj[id];
        const [lastName, firstName] = fullName.split(',').map((s:string) => s.trim());
        flatPeople.push({
          id,
          fullName,
          lastName,
          firstName
        });
      });
    });
    this.peopleIndex = flatPeople;
    this.searchPeopleIndex(queryString);
  });
}

  searchPeopleIndex(queryString: string): void {
  if (!this.peopleIndex) return;
  const q = queryString.toLowerCase();
  this.peopleSuggestions = this.peopleIndex
    .filter(person =>
      person.lastName.toLowerCase().includes(q) ||
      person.firstName.toLowerCase().includes(q) ||
      person.fullName.toLowerCase().includes(q)
    )
    .map(person => person.fullName)
    .sort();
}

  /** build the edit/detail URL based on record type */
  linkto(item: string, rectype: string): string {
    if (rectype === 'dap') {
      return this.dapEDIT + item;
    } else if (rectype === 'dmp') {
      return this.dmpEDIT + item;
    }
    return '';
  }

  /**
   * open dmp edit/detail page in a new tab based 
   */
  visitPage(dmp: Dmp) {
    const url = this.linkto(dmp.id, dmp.type?.toLowerCase() ?? '');
    if (url) {
      window.open(url, '_blank');
    }
  }

  /** If you want “Edit Data” to also open the edit page in the same dialog or route */
  editData(item: Dmp) {
    this.visitPage(item);
  }

  /**
   * Collapse the advanced search panel and apply all filters.
   * Called by the "Apply Filters" button in the advanced search panel.
   */
  applyAdvancedSearch() {
    this.advancedSearchExpanded = false;
    this.isLoading = true;

    setTimeout(() => {
      this.activeKeywords.set([...this.pendingKeywords]);
      this.applyFilters();
      this.hasFilters.set(this.pendingFilterCount > 0);
      this.isLoading = false;
    }, 1500);
  }

  get pendingFilterCount(): number {
    let cnt = 0;
    // 1) text search?
    if (this.searchTerm.trim()) cnt++;
    // 2) keywords
    if (this.pendingKeywords.length) cnt++;
    // 3) org unit
    if (this.orgUnitControl.value) cnt++;
    // 4) owner
    if (this.ownerControl.value) cnt++;
    // 5) resource types
    if (this.resourceTypeControl.value.length) cnt++;
    // 6) statuses
    if (this.statusControl.value.length) cnt++;
    // 7) paper publication toggle
    if (this.hasPaperPublication) cnt++;
    // 8–11) date filters
    if (this.dateFilterType === 'exact' && this.exactDate) cnt++;
    if (this.dateFilterType === 'before' && this.beforeDate) cnt++;
    if (this.dateFilterType === 'after' && this.afterDate) cnt++;
    if (
      this.dateFilterType === 'between' &&
      this.dateRange.start && this.dateRange.end
    ) cnt++;
    return cnt;
  }

  /**
   * Resets the search UI to its original state: clears all text search, keywords,
   * form controls, and date filters, and resets the table to the full list of DMPs.
   * Called by the "Cancel" button in the advanced search panel.
   */
  cancelAdvancedSearch() {
    this.advancedSearchExpanded = false;

    // clear any typed search
    this.searchTerm = '';
    this.searchTerm = '';
    this.searchPerformed = false;
    this.hasFilters.set(false);

    // clear pending & active keyword buffers
    this.pendingKeywords = [];
    this.activeKeywords.set([]);

    // reset form controls
    this.orgUnitControl.setValue('');
    this.ownerControl.setValue('');
    this.resourceTypeControl.setValue([]);
    this.statusControl.setValue([]);
    this.hasPaperPublication = false;

    // reset date filters
    this.dateFilterType = 'between';
    this.dateRange = { start: null, end: null };
    this.exactDate = undefined;
    this.beforeDate = undefined;
    this.afterDate = undefined;

    // reset table to full list
    this.updateDataSource();
    this.paginator?.firstPage();
  }


  /**
   * Toggle the export menu.
   */
  toggleMenu() {
    this.menuOpened.set(!this.menuOpened());
  }

  /**
   * Exports the currently filtered table data.
   * Delegates to ExportService for JSON, CSV, or PDF generation.
   */
  exportData(format: 'json' | 'csv' | 'pdf'): void {
    const records = this.dataSource.filteredData;

    if (records.length === 0) {
      // No records, show message to user
      this._snackBar.open('No records to export.', 'Dismiss', { duration: 3000 });
      return;
    }

    switch (format) {
      case 'json':
        this.exportService.exportJSON(records);
        break;

      case 'csv':
        this.exportService.exportCSV(records);
        break;

      case 'pdf':
        this.exportService.exportPDF(records);
        break;
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.pendingKeywords.push(value);
    }
    event.chipInput!.clear();
  }

  remove(kw: string): void {
    this.pendingKeywords = this.pendingKeywords.filter(x => x !== kw);
  }

  edit(old: string, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      return this.remove(old);
    }
    this.pendingKeywords = this.pendingKeywords.map(x => x === old ? value : x);
  }

  onDateFilterChange() {
    this.exactDate = undefined;
    this.beforeDate = undefined;
    this.afterDate = undefined;
    this.dateRange = { start: null, end: null };
  }

  advancedSearchExpanded: boolean = false;

  /**
   * Applies all filters to the data source.
   * This method is called whenever the user changes the search term,
   * selects a new organization unit, owner, type, status, or date range,
   * or toggles the "has paper publication" filter.
   */
  applyFilters() {
  const crit = this.currentCriteria();
  //console.log('Applying filters:', crit);
  const merged: DmpOrDap[] = [
    ...this.dataService.dmps(),
    ...this.dataService.daps()
  ];
  const filtered = this.filterService.filterDmpOrDapList(merged, crit);
  this.dataSource.data = filtered;
  this.paginator?.firstPage();
}

  /**
   * Clears all filters and simulates loading (used by "Clear Filters" button).
   * Reset filters and table data.
   */
  clearFilters() {
    this._clearFilters();
    this.pendingKeywords = [];
    this.activeKeywords.set([]);

  }

  /**
   * Clear all filters and reset the table to the full list of DMPs.
   * This method is called by cancelAdvancedSearch() and clearFilters().
   * It resets all form controls, chips, and date filters. It also resets
   * the table data and the paginator.
   * Shows a snackbar to confirm the filters have been cleared.
   */
  private _clearFilters() {
    // 1) Text search
    this.searchTerm = '';
    this.searchPerformed = false;
    this.hasFilters.set(false);

    // 2) Autocomplete controls
    this.orgUnitControl.setValue('');
    this.ownerControl.setValue('');

    // 3) Keyword chips
    this.pendingKeywords = [];
    this.activeKeywords.set([]);

    // 4) Date filters
    this.dateFilterType = 'between';
    this.dateRange = { start: null, end: null };
    this.exactDate = undefined;
    this.beforeDate = undefined;
    this.afterDate = undefined;

    // 5) Resource type & status chip-listboxes
    this.resourceTypeControl.setValue([]);
    this.statusControl.setValue([]);

    // 6) Paper-publication checkbox
    this.hasPaperPublication = false;

    // Reset table data back to full list
    this.updateDataSource();
    if (this.paginator) {
      this.paginator.firstPage();
    }

    this._snackBar.open('Showing all results.', 'Dismiss', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3000
    });
  }

  /**
   * Opens a dialog to save the current filter settings under a specified name.
   * If a name is provided, the filter settings are saved to local storage.
   * Displays a notification upon successful save.
   */
  saveFilters() {
    const dialogRef = this.dialog.open(SaveFilterDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(name => {
      if (!name) return;

      // Build filter criteria the FilterService expects:
      const filterState: FilterCriteria = {
        query: this.searchTerm,
        keywords: [...this.activeKeywords()],
        orgUnit: this.orgUnitControl.value,
        owner: this.ownerControl.value,
        types: this.resourceTypeControl.value,
        statuses: this.statusControl.value,
        hasPublication: this.hasPaperPublication,
        dateFilterType: this.dateFilterType,
        rangeStart: this.dateRange.start,
        rangeEnd: this.dateRange.end,
        exactDate: this.exactDate,
        beforeDate: this.beforeDate,
        afterDate: this.afterDate
      };

      localStorage.setItem(
        `filter-${name}`,
        JSON.stringify(filterState)
      );
      this._snackBar.open(`Filter "${name}" saved.`, 'Dismiss', { duration: 3000 });
    });
  }

  /**
   * Opens a dialog to let the user pick a previously‐saved filter.
   * When one is chosen, loads it, converts date‐strings back into Date objects,
   * then applies the filters.
   */
  loadFilters() {
    const filterNames = Object
      .keys(localStorage)
      .filter(k => k.startsWith('filter-'))
      .map(k => k.replace('filter-', ''));

    const dialogRef = this.dialog.open(LoadFilterDialogComponent, {
      width: '400px',
      data: { filterNames }
    });

    dialogRef.afterClosed().subscribe(name => {
      if (!name) return;
      const raw = localStorage.getItem(`filter-${name}`);
      if (!raw) return;

      try {
        const f = JSON.parse(raw) as FilterCriteria;

        // 1) Restore controls
        this.searchTerm = f.query || '';
        this.orgUnitControl.setValue(f.orgUnit || '');
        this.ownerControl.setValue(f.owner || '');
        this.resourceTypeControl.setValue(f.types || []);
        this.statusControl.setValue(f.statuses || []);
        this.hasPaperPublication = !!f.hasPublication;
        this.dateFilterType = f.dateFilterType;

        // 2) Convert dates back to Date instances
        this.dateRange = {
          start: f.rangeStart ? new Date(f.rangeStart) : null,
          end: f.rangeEnd ? new Date(f.rangeEnd) : null
        };
        this.exactDate = f.exactDate ? new Date(f.exactDate) : undefined;
        this.beforeDate = f.beforeDate ? new Date(f.beforeDate) : undefined;
        this.afterDate = f.afterDate ? new Date(f.afterDate) : undefined;

        // 3) Restore chips
        this.pendingKeywords = [...(f.keywords || [])];
        this.activeKeywords.set([...(f.keywords || [])]);

        // 4) Finally apply
        this.searchPerformed = true;
        this.hasFilters.set(true);
        this.applyFilters();

        this._snackBar.open(`Filter "${name}" loaded.`, 'Dismiss', { duration: 3000 });
      } catch (err) {
        console.error('Failed to load filter', err);
      }
    });
  }


  searchWithTextQuery(url: string, searchTerm: string, type: string, authToken: string): Observable<any[]> {
    const searchJSON = {
      filter: {
        $and: [
          {
            $text: {
              $search: searchTerm
            }
          }
        ]
      },
      permissions: ['read', 'write']
    };

    return this.http.post(url, searchJSON, {
      headers: {
        Authorization: 'Bearer ' + authToken
      }
    }).pipe(
      map((responseData: any) => {
        if (responseData) {
          console.log(`Loaded ${responseData.length} ${type} records`);
          console.log(responseData);
          return responseData;
        } else {
          console.log(`No ${type} records found`);
          return [];
        }
      })
    );
  }

  ngOnInit() {
  this.isLoading = true;

  const waitForToken = () => {
    const token = this.dataService['credsService'].token();
    if (token) {
      this.dataService.loadAll().pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.updateDataSource();
        },
        error: () => {
          this.isLoading = false;
          this._snackBar.open('Failed to load search data.', 'Dismiss', { duration: 3000 });
        }
      });

    } else {
      setTimeout(waitForToken, 100); // Try again in 100ms
    }
  };

  waitForToken();
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Open the help dialog that describes how to use the advanced search.
   * @param event the mouse event that triggered the button click
   */
  openHelpDialog(event: MouseEvent) {
    event.stopPropagation();
    this.dialog.open(HelpDialogComponent, {
      width: '400px',
      maxWidth: '80vw',
      data: {}
    });
  }

  private updateDataSource() {
    const merged: DmpOrDap[] = [
      ...this.dataService.dmps(),
      ...this.dataService.daps()
    ];
    //console.log('Merged data:', merged);
    this.dataSource.data = merged;
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }


  /**
   * Re-apply all filters and re-fetch data from the server.
   * Called when the user presses the "Search" button.
   * @remarks
   * This method is a no-op if the user has not entered any search terms
   * or selected any filters.
   */
  performSearch() {
    this.searchPerformed = true;
    this.hasFilters.set(true); // This will activate Clear Filters button
    this.applyFilters(); // reuse existing logic
  }

  /**
   * Maps a status string (e.g. 'published', 'edit', 'reviewed')
   * to a class name for a status chip (e.g. 'status-success', 'status-warning', 'status-info')
   * @returns a class name, or an empty string if the status is not recognized
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'published':
        return 'status-success';
      case 'edit':
        return 'status-warning';
      case 'reviewed':
        return 'status-info';
      default:
        return '';
    }
  }

  /** Re‐fetch from the server and re‐apply current filters */
  refreshResults() {
    this.isLoading = true;

    this.dataService.getDmps().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: list => {
        // update the master list
        this.updateDataSource();

        // if we have already applied filters at least once, re‐apply them
        if (this.hasFilters()) {
          this.applyFilters();
        }
      },
      error: err => {
        console.error('Refresh failed', err);
        this._snackBar.open(
          'Failed to refresh from MDSTest server.',
          'Dismiss',
          { duration: 3000 }
        );
      }
    });
  }
}
