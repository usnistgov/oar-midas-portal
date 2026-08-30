import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  computed,
  inject,
  signal,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDrawer } from '@angular/material/sidenav';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { take, catchError, map } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../services/data.service';
import { CredentialsService } from '../../services/credentials.service';
import { PeopleService } from '../../services/people.service';
import { SearchFilterService, FilterCriteria } from '../../services/search-filter.service';
import { Dmp, Dap } from '../../models/dashboard';
import { RecordRef, PermissionsService, GroupsService, Acls, ConfigurationService } from 'oarng';
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
  private permsSvc = inject(PermissionsService);
  private groupsSvc = inject(GroupsService);
  private configSvc = inject(ConfigurationService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);

  isLoading = false;

  private adminData: OwnedRecord[] = [];

  dataSource = new MatTableDataSource<OwnedRecord>([]);
  selection = new SelectionModel<OwnedRecord>(true, []);

  displayedColumns = ['select', 'id', 'name', 'type', 'status', 'modifiedDate', 'permView', 'permUpdate', 'permAdmin'];

  readonly aclsMap = signal<{ [id: string]: Acls }>({});
  readonly subjectLabels = signal<{ [subject: string]: string }>({});

  private groupNamesCache: { [id: string]: string } = {};
  private resolvedSubjects = new Set<string>();

  readonly drawerOpen = signal(false);
  readonly activeDrawerTab = signal(0);
  readonly drawerSection = computed<'permissions' | 'groups'>(() =>
    this.activeDrawerTab() === 0 ? 'permissions' : 'groups'
  );

  readonly selectedRecords = signal<RecordRef[]>([]);
  readonly userOu = computed(() => this.credsSvc.userAttributes()?.['userOU'] as string ?? '');

  constructor() {
    this.selection.changed.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      // Deduplicate by ID — data refreshes create new object instances for the same record,
      // and both the old and new references can briefly coexist in SelectionModel.
      const seen = new Set<string>();
      const unique: RecordRef[] = [];
      for (const r of this.selection.selected) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          unique.push({
            id: r.id,
            apiBase: r.type?.toLowerCase() === 'dap'
              ? this.dataService.resolveApiUrl('dapAPI')
              : this.dataService.resolveApiUrl('dmpAPI')
          });
        }
      }
      this.selectedRecords.set(unique);

      if (this.selection.selected.length > 0) {
        this.drawerOpen.set(true);
        this.permDrawer?.open();
      } else if (this.activeDrawerTab() !== 1) {
        // Close the drawer when all records are deselected (unless user is managing groups)
        this.drawerOpen.set(false);
        this.permDrawer?.close();
      }
    });
  }

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
    return this.adminData.length;
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('permDrawer') permDrawer!: MatDrawer;

  ngOnInit(): void {
    this.isLoading = true;

    let cancelled = false;
    this.destroyRef.onDestroy(() => { cancelled = true; });

    const waitForToken = () => {
      if (cancelled) return;
      if (this.credsSvc.token()) {
        this.dataService.loadAll().subscribe({
          next: () => {
            if (cancelled) return;
            this.loadGroupsForLabels();
            this.loadAllAcls();
          },
          error: () => { if (!cancelled) this.isLoading = false; }
        });
      } else {
        setTimeout(waitForToken, 100);
      }
    };
    waitForToken();

    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const type = params['type'];
      if (type) {
        this.resourceTypeControl.setValue([type.toLowerCase()]);
      }
    });

    this.orgUnitControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(v => {
      this.getOrgs(v);
      this.applyFilters();
    });
    this.resourceTypeControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.applyFilters());
    this.statusControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private buildAdminRecords(): void {
    const userId = this.credsSvc.userId() ?? '';
    const winId = this.credsSvc.userAttributes()?.['winId'] as string | undefined;

    const allRecords: OwnedRecord[] = [
      ...this.dataService.dmps().map(d => ({ ...d, type: d.type ?? 'DMP' })),
      ...this.dataService.daps().map(d => ({ ...d, type: d.type ?? 'DAP' }))
    ];

    this.adminData = allRecords.filter(r => {
      const acls = this.aclsMap()[r.id];
      if (!acls) return false;
      const adminList = acls.admin ?? [];
      const isAdmin = adminList.includes(userId) || (winId ? adminList.includes(winId) : false);
      const isOwner = r.owner === userId || (winId ? r.owner === winId : false);
      return isOwner || isAdmin;
    });

    this.applyFilters();
  }

  applyFilters(): void {
    const criteria = this.currentCriteria();
    const filtered = this.filterService.filterDmpOrDapList(
      this.adminData as any[],
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
    this.dataSource.data = [...this.adminData];
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

  deselectRecord(id: string): void {
    const record = this.selection.selected.find(r => r.id === id);
    if (record) this.selection.deselect(record);
  }

  onRowClick(row: OwnedRecord): void {
    // If this row is already the only selection, keep it — don't re-add it
    if (this.selection.isSelected(row) && this.selection.selected.length === 1) {
      this.activeDrawerTab.set(0);
      this.drawerOpen.set(true);
      this.permDrawer.open();
      return;
    }
    this.selection.clear();
    this.selection.select(row);
    this.activeDrawerTab.set(0);
    this.drawerOpen.set(true);
    this.permDrawer.open();
  }

  openGroupsManagement(): void {
    this.activeDrawerTab.set(1);
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

  private loadGroupsForLabels(): void {
    this.groupsSvc.getGroups().subscribe({
      next: groups => {
        groups.forEach(g => { this.groupNamesCache[g.id] = g.name; });
        // Re-resolve any subjects already loaded that may be group IDs
        const current = this.subjectLabels();
        const updates: { [s: string]: string } = {};
        for (const [subject, label] of Object.entries(current)) {
          if (label === subject && this.groupNamesCache[subject]) {
            updates[subject] = this.groupNamesCache[subject];
          }
        }
        if (Object.keys(updates).length) {
          this.subjectLabels.update(m => ({ ...m, ...updates }));
        }
      },
      error: () => {}
    });
  }

  // Only the records in the drawer changed, so refresh just those rather than
  // re-reading the listings, which still hold the pre-edit acls.
  onPermissionsChanged(): void {
    const records = this.selectedRecords();
    if (!records.length) return;

    forkJoin(
      records.map(r => this.permsSvc.getAcls(r).pipe(
        map(acls => ({ id: r.id, acls })),
        catchError(() => of(null))
      ))
    ).subscribe(results => {
      const resolved = results.filter(Boolean) as { id: string; acls: Acls }[];
      if (resolved.length < records.length) {
        this.snackBar.open('Some permissions could not be refreshed.', 'Dismiss', { duration: 5000 });
      }

      const subjects = new Set<string>();
      this.aclsMap.update(m => {
        const next = { ...m };
        for (const { id, acls } of resolved) {
          next[id] = acls;
          for (const s of [...(acls.read ?? []), ...(acls.write ?? []),
                           ...(acls.admin ?? []), ...(acls.delete ?? [])]) {
            subjects.add(s);
          }
        }
        return next;
      });

      this.buildAdminRecords();
      this.resolveSubjectLabels([...subjects]);
    });
  }

  private readonly ORG_ENDPOINT: Record<string, string> = {
    nistou: 'OU', nistdiv: 'Div', nistgrp: 'Group',
  };

  private resolveSubjectLabels(subjects: string[]): void {
    const orgBaseUrl = ((this.configSvc.getConfig<any>()['orgURL'] ?? '') as string).replace(/\/index$/, '');

    subjects.forEach(subject => {
      if (this.resolvedSubjects.has(subject)) return;
      this.resolvedSubjects.add(subject);

      if (this.groupNamesCache[subject]) {
        this.subjectLabels.update(m => ({ ...m, [subject]: this.groupNamesCache[subject] }));
        return;
      }

      const colonIdx = subject.indexOf(':');
      const prefix = colonIdx > 0 ? subject.substring(0, colonIdx) : '';
      const afterColon = colonIdx > 0 ? subject.substring(colonIdx + 1) : '';

      if (/^nist(ou|div|grp)$/.test(prefix)) {
        // New format "nistdiv:13289" — query typed endpoint, use outer key (org code) for display
        const endpoint = this.ORG_ENDPOINT[prefix];
        if (endpoint && orgBaseUrl) {
          this.http.get<any>(`${orgBaseUrl}/${endpoint}/index`).pipe(
            catchError(() => of({}))
          ).subscribe((raw: any) => {
            const info = this.extractOrgInfo(raw, afterColon);
            this.subjectLabels.update(m => ({
              ...m,
              [subject]: info ? `${info.name} (${info.code})` : subject
            }));
          });
        }
        return;
      }

      if (/^\d+$/.test(prefix) && /^\d+$/.test(afterColon)) {
        // Legacy format "775:13289" (orgCode:orgId) — try all 3 types
        const orgCode = prefix;
        const orgId = afterColon;
        if (orgBaseUrl) {
          const endpoints = ['OU', 'Div', 'Group'];
          forkJoin(
            endpoints.map(ep =>
              this.http.get<any>(`${orgBaseUrl}/${ep}/index`).pipe(
                catchError(() => of({}))
              )
            )
          ).subscribe((responses: any[]) => {
            for (const raw of responses) {
              const info = this.extractOrgInfoByCode(raw, orgCode, orgId);
              if (info) {
                this.subjectLabels.update(m => ({ ...m, [subject]: `${info.name} (${orgCode})` }));
                return;
              }
            }
          });
        }
        return;
      }

      if (/^[a-z]+$/.test(prefix) && /^\d+$/.test(afterColon)) {
        // Org abbreviation format "mml:13213" — scan all 3 endpoints by orgId, get code from outer key
        const orgId = afterColon;
        if (orgBaseUrl) {
          const endpoints = ['OU', 'Div', 'Group'];
          forkJoin(
            endpoints.map(ep =>
              this.http.get<any>(`${orgBaseUrl}/${ep}/index`).pipe(
                catchError(() => of({}))
              )
            )
          ).subscribe((responses: any[]) => {
            for (const raw of responses) {
              const info = this.extractOrgInfo(raw, orgId);
              if (info) {
                this.subjectLabels.update(m => ({ ...m, [subject]: `${info.name} (${info.code})` }));
                return;
              }
            }
          });
        }
        return;
      }

      if (/^\d+$/.test(subject)) {
        this.subjectLabels.update(m => ({ ...m, [subject]: `Org (${subject})` }));
        return;
      }

      // Search the people API with the EID as query; look for an exact key match in the response
      this.peopleService.resolveEidLabel(subject).subscribe(name => {
        this.subjectLabels.update(m => ({ ...m, [subject]: name ?? subject }));
      });
    });
  }

  // Find org by its numeric ID; returns { name, code } where code is the outer key (org number)
  private extractOrgInfo(raw: any, numericId: string): { name: string; code: string } | null {
    if (!raw || typeof raw !== 'object') return null;
    for (const [code, group] of Object.entries(raw)) {
      if (group && typeof group === 'object') {
        const raw_name = (group as any)[numericId];
        if (raw_name) {
          const name = (raw_name as string).replace(/\s*\(\d+\)\s*$/, '');
          return { name, code };
        }
      }
    }
    return null;
  }

  // Find org by both outer key (orgCode) and inner key (orgId) — for legacy "code:id" subjects
  private extractOrgInfoByCode(raw: any, orgCode: string, orgId: string): { name: string } | null {
    if (!raw || typeof raw !== 'object') return null;
    const group = raw[orgCode];
    if (group && typeof group === 'object') {
      const raw_name = group[orgId];
      if (raw_name) {
        const name = (raw_name as string).replace(/\s*\(\d+\)\s*$/, '');
        return { name };
      }
    }
    return null;
  }

  // The record listings already carry acls, so this needs no HTTP at all.
  private loadAllAcls(): void {
    const acls: { [id: string]: Acls } = {};
    const subjects = new Set<string>();
    let missing = 0;

    for (const r of [...this.dataService.dmps(), ...this.dataService.daps()]) {
      if (!r.acls) { missing++; continue; }
      acls[r.id] = r.acls;
      for (const s of [...(r.acls.read ?? []), ...(r.acls.write ?? []),
                       ...(r.acls.admin ?? []), ...(r.acls.delete ?? [])]) {
        subjects.add(s);
      }
    }

    if (missing) {
      console.warn(`${missing} record(s) returned without acls; they cannot be shown here.`);
    }

    this.aclsMap.set(acls);
    this.buildAdminRecords();
    this.isLoading = false;
    this.resolveSubjectLabels([...subjects]);
  }


  recordSubjects(id: string): string[] {
    const acls = this.aclsMap()[id];
    if (!acls) return [];
    const all = [...(acls.read ?? []), ...(acls.write ?? []), ...(acls.admin ?? []), ...(acls.delete ?? [])];
    return [...new Set(all)];
  }

  subjectPermLevel(id: string, subject: string): 'admin' | 'update' | 'view' | null {
    const acls = this.aclsMap()[id];
    if (!acls) return null;
    const r = (acls.read   ?? []).includes(subject);
    const w = (acls.write  ?? []).includes(subject);
    const a = (acls.admin  ?? []).includes(subject);
    const d = (acls.delete ?? []).includes(subject);
    if (a) return 'admin';
    if (w && r) return 'update';
    if (r) return 'view';
    return null;
  }

  recordSubjectsByLevel(id: string): { level: 'admin' | 'update' | 'view'; subjects: string[] }[] {
    const groups: Record<'admin' | 'update' | 'view', string[]> = { admin: [], update: [], view: [] };
    for (const s of this.recordSubjects(id)) {
      const level = this.subjectPermLevel(id, s);
      if (level) groups[level].push(s);
    }
    return (['admin', 'update', 'view'] as const)
      .filter(l => groups[l].length > 0)
      .map(l => ({ level: l, subjects: groups[l] }));
  }

  getSubjectsForLevel(id: string, level: 'view' | 'update' | 'admin'): string[] {
    const group = this.recordSubjectsByLevel(id).find(g => g.level === level);
    if (!group) return [];
    const labels = this.subjectLabels();
    return group.subjects.map(s => labels[s] || s);
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
