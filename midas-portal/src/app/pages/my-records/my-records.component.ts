import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { DataService } from '../../services/data.service';
import { CredentialsService } from '../../services/credentials.service';
import { PeopleService } from '../../services/people.service';
import { SearchFilterService, FilterCriteria } from '../../services/search-filter.service';
import { Dmp, Dap } from '../../models/dashboard';
import { RecordRef } from 'oarng';
import { getStatusClass as statusClassUtil } from '../../shared/table-utils';

type OwnedRecord = (Dmp | Dap) & { type: string };

@Component({
  selector: 'app-my-records',
  templateUrl: './my-records.component.html',
  styleUrls: ['./my-records.component.scss']
})
export class MyRecordsComponent implements OnInit, AfterViewInit {
  private dataService = inject(DataService);
  private credsSvc = inject(CredentialsService);
  private peopleService = inject(PeopleService);
  private filterService = inject(SearchFilterService);

  isLoading = false;

  private ownedData: OwnedRecord[] = [];

  dataSource = new MatTableDataSource<OwnedRecord>([]);
  selection = new SelectionModel<OwnedRecord>(true, []);

  displayedColumns = ['select', 'id', 'name', 'type', 'status', 'modifiedDate'];

  readonly drawerOpen = signal(false);

  readonly selectedRecords = computed<RecordRef[]>(() =>
    this.selection.selected.map(r => ({
      id: r.id,
      apiBase: r.type?.toLowerCase() === 'dap'
        ? this.dataService.resolveApiUrl('dapAPI')
        : this.dataService.resolveApiUrl('dmpAPI')
    }))
  );

  // Filter state
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly addOnBlur = true;

  searchTerm = '';
  pendingKeywords: string[] = [];
  activeKeywords = signal<string[]>([]);
  hasPaperPublication = false;
  dateFilterType: 'exact' | 'before' | 'after' | 'between' = 'between';
  dateRange = { start: null as Date | null, end: null as Date | null };
  exactDate?: Date;
  beforeDate?: Date;
  afterDate?: Date;

  orgUnitControl = new FormControl<string>('', { nonNullable: true });
  resourceTypeControl = new FormControl<string[]>([], { nonNullable: true });
  statusControl = new FormControl<string[]>([], { nonNullable: true });

  orgSuggestions: string[] = [];

  readonly resourceTypes = ['DMP', 'DAP'];
  readonly statuses = [
    { label: 'Published', value: 'published' },
    { label: 'Edit', value: 'edit' },
    { label: 'Reviewed', value: 'reviewed' }
  ];

  filterPills: string[] = [];

  get hasFilters(): boolean {
    return this.filterPills.length > 0;
  }

  get totalCount(): number {
    return this.ownedData.length;
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('permDrawer') permDrawer!: MatDrawer;

  ngOnInit(): void {
    this.isLoading = true;

    const waitForToken = () => {
      if (this.credsSvc.token()) {
        this.dataService.loadAll().subscribe({
          next: () => {
            this.buildOwnedData();
            this.applyFilters();
            this.isLoading = false;
          },
          error: () => { this.isLoading = false; }
        });
      } else {
        setTimeout(waitForToken, 100);
      }
    };
    waitForToken();

    this.orgUnitControl.valueChanges.subscribe(v => {
      this.getOrgs(v);
      this.applyFilters();
    });
    this.resourceTypeControl.valueChanges.subscribe(() => this.applyFilters());
    this.statusControl.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private buildOwnedData(): void {
    const userId = this.credsSvc.userId();
    const winId = this.credsSvc.userAttributes()?.['winId'];

    const dmps: OwnedRecord[] = this.dataService.dmps()
      .filter(d => d.owner === userId || d.owner === winId)
      .map(d => ({ ...d, type: d.type ?? 'DMP' }));

    const daps: OwnedRecord[] = this.dataService.daps()
      .filter(d => d.owner === userId || d.owner === winId)
      .map(d => ({ ...d, type: d.type ?? 'DAP' }));

    this.ownedData = [...dmps, ...daps];
  }

  applyFilters(): void {
    const criteria = this.currentCriteria();
    const filtered = this.filterService.filterDmpOrDapList(
      this.ownedData as any[],
      criteria
    ) as OwnedRecord[];
    this.dataSource.data = filtered;
    this.filterPills = this.filterService.buildParts(criteria);
    this.paginator?.firstPage();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.pendingKeywords = [];
    this.activeKeywords.set([]);
    this.orgUnitControl.setValue('');
    this.resourceTypeControl.setValue([]);
    this.statusControl.setValue([]);
    this.hasPaperPublication = false;
    this.dateFilterType = 'between';
    this.dateRange = { start: null, end: null };
    this.exactDate = undefined;
    this.beforeDate = undefined;
    this.afterDate = undefined;
    this.dataSource.data = [...this.ownedData];
    this.filterPills = [];
    this.paginator?.firstPage();
  }

  onDateFilterChange(): void {
    this.exactDate = undefined;
    this.beforeDate = undefined;
    this.afterDate = undefined;
    this.dateRange = { start: null, end: null };
    this.applyFilters();
  }

  addKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.pendingKeywords.push(value);
      this.activeKeywords.set([...this.pendingKeywords]);
      this.applyFilters();
    }
    event.chipInput!.clear();
  }

  removeKeyword(kw: string): void {
    this.pendingKeywords = this.pendingKeywords.filter(x => x !== kw);
    this.activeKeywords.set([...this.pendingKeywords]);
    this.applyFilters();
  }

  getOrgs(query: string): void {
    if (query.length < 2) {
      this.orgSuggestions = [];
      return;
    }
    this.peopleService.getNISTOrganizations(query.toUpperCase())
      .subscribe((rawOrgs: Record<string, any>) => {
        const flat: { name: string, key: string }[] = [];
        Object.keys(rawOrgs).forEach(orgKey => {
          Object.keys(rawOrgs[orgKey]).forEach(id => {
            flat.push({ name: rawOrgs[orgKey][id], key: orgKey });
          });
        });
        const q = query.toLowerCase();
        this.orgSuggestions = Array.from(new Set(
          flat
            .filter(o => o.name.toLowerCase().includes(q) || o.key.toLowerCase().includes(q))
            .map(o => o.name)
            .filter(Boolean)
        )).sort();
      });
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.filteredData.length
      && this.dataSource.filteredData.length > 0;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.filteredData.forEach(r => this.selection.select(r));
    }
  }

  openPermissions(): void {
    this.drawerOpen.set(true);
    this.permDrawer.open();
  }

  closePermissions(): void {
    this.drawerOpen.set(false);
    this.permDrawer.close();
  }

  getStatusClass(status: string): string {
    return statusClassUtil(status);
  }

  linkto(id: string, rectype: string): string {
    if (rectype === 'dap') {
      return this.dataService.resolveApiUrl('dapEDIT').concat(id).concat('?editEnabled=true');
    } else if (rectype === 'dmp') {
      return this.dataService.resolveApiUrl('dmpEDIT').concat(id);
    }
    return '';
  }

  private currentCriteria(): FilterCriteria {
    return {
      query: this.searchTerm,
      keywords: this.activeKeywords(),
      orgUnit: this.orgUnitControl.value,
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
}
