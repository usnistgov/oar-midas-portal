import {
  Component,
  AfterViewInit,
  ViewChild,
  signal,
  computed,
  effect
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { input } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Widget } from '../../../models/dashboard';
import { getMaxVisibleRows } from '../table-utils';

import { getStatusClass as statusClassUtil } from '../../../shared/table-utils';

interface Dmp {
  id: string;
  name: string;
  owner: string;
  primaryContact: string;
  modifiedDate: Date;
}

@Component({
  selector: 'app-dmp-table',
  templateUrl: './dmp-table.component.html',
  styleUrls: ['./dmp-table.component.scss']
})
export class DmpTableComponent implements AfterViewInit {

  dataSource = new MatTableDataSource<Dmp>([]);
  widget = input.required<Widget>();

  length = computed(() => this.dataService.dmps().length);
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  isLoading = signal(false);

  allColumns = [
    { key: 'name',           label: 'Name' },
    { key: 'owner',          label: 'Owner' },
    { key: 'status',         label: 'Status' }, // added status column
    { key: 'primaryContact', label: 'Primary Contact' },
    { key: 'modifiedDate',   label: 'Last Modified' }
  ];

  readonly allColumnKeys = this.allColumns.map(c => c.key);

  displayedColumnSet = new Set<string>(this.allColumnKeys);

  get displayedColumns(): string[] {
    return this.allColumnKeys.filter(k => this.displayedColumnSet.has(k));
  }

  /** Called by each checkbox: add/remove the key. */
  toggleColumn(key: string, on: boolean) {
    if (on) this.displayedColumnSet.add(key);
    else    this.displayedColumnSet.delete(key);
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService) {
    // keep table data in sync with the signal
    effect(() => {
      const dmps = this.dataService.dmps();
      this.dataSource.data = dmps;
      this.dataSource._updateChangeSubscription();
    });

    effect(() => {
      try {
        const widget = this.widget();
        if (widget?.rows !== undefined) {
          const rows = widget.rows;
          this.dataSource._updateChangeSubscription();
        }
      } catch (widgetError: unknown) {
        if (String(widgetError).includes('NG0950')) {
          console.log('🔄 Widget signal NG0950 error - will retry...');
          return;
        }
        throw widgetError;
      }
    });

    effect(() => {
      try {
        let widget;
        
        // Try to get the widget signal
        try {
          widget = this.widget();
        } catch (widgetError: unknown) {
          if (String(widgetError).includes('NG0950')) {
            console.log('🔄 Widget signal NG0950 error - will retry...');
            return;
          }
          throw widgetError;
        }
        
        if (widget?.rows !== undefined) {
          // Calculate page size based on current widget data
          const newPageSize = getMaxVisibleRows(widget.rows);
          
          // Only update if it actually changed
          if (this.pageSize !== newPageSize) {
            //console.log('📊 Widget rows changed - updating pageSize from', this.pageSize, 'to', newPageSize);
            this.pageSize = newPageSize;
            
            const baseOptions = [5, 10, 15];
            const ps = this.pageSize;
            this.pageSizeOptions = baseOptions.includes(ps) ? baseOptions : [...baseOptions, ps];
          }
        }
      } catch (error: unknown) {
        if (String(error).includes('NG0950')) {
          console.log('🔄 Effect NG0950 error caught - retrying after stabilization...');
          return;
        }
        console.error('❌ Unexpected error in widget effect:', error);
      }
    });
  }

  ngAfterViewInit() {
    // wire up sorting & pagination
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /** simple client‐side filter */
  applyFilter(event: Event) {
    const filter = (event.target as HTMLInputElement)
      .value.trim().toLowerCase();
    this.dataSource.filter = filter;
  }

  /** link to DMP detail page */
  linkto(id: string): string {
    return this.dataService.resolveApiUrl('dmpEDIT').concat(id)
  }

  getStatusClass(status: string): string {
    return statusClassUtil(status);
  }

  /** open the create‐new page */
  createDmp() {
    // opens URL from localStorage (via service getter)
    window.open(this.dataService.dmpUI, '_blank');
  }

  clearFilter(input: HTMLInputElement) {
    input.value = '';
    this.applyFilter({ target: input } as unknown as Event);
    input.focus(); // Optional: keep focus on the input after clearing
  }
}