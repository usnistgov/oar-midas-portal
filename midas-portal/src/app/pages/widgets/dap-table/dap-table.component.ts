import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  signal,
  computed,
  effect
} from '@angular/core';
import { MatPaginator }       from '@angular/material/paginator';
import { MatSort }            from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { input } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Dap } from '../../../models/dashboard';
import { Widget } from '../../../models/dashboard';
import { getMaxVisibleRows } from '../table-utils';

import { getStatusClass as statusClassUtil } from '../../../shared/table-utils';

@Component({
  selector: 'app-dap-table',
  templateUrl: './dap-table.component.html',
  styleUrls: ['./dap-table.component.scss']
})
export class DapTableComponent implements  AfterViewInit {
  dataSource       = new MatTableDataSource<Dap>([]);
  length           = computed(() => this.dataService.daps().length);
  widget = input.required<Widget>();

  /** Loading state for overlay */
  isLoading = signal(false);
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // Master list of columns
  allColumns = [
    { key: 'name',           label: 'Name' },
    { key: 'owner',          label: 'Owner' },
    { key: 'status',         label: 'Status' },
    { key: 'primaryContact', label: 'Primary Contact' },
    { key: 'modifiedDate',   label: 'Last Modified' },
    // add more if you need an "actions" column, etc.
  ];

  // Keys in order
  readonly allColumnKeys = this.allColumns.map(c => c.key);

  // Track visible columns
  displayedColumnSet = new Set<string>(this.allColumnKeys);

  // Expose to the template
  get displayedColumns(): string[] {
    return this.allColumnKeys.filter(k => this.displayedColumnSet.has(k));
  }

  /** Called by each checkbox to add/remove the key */
  toggleColumn(key: string, on: boolean) {
    if (on)   this.displayedColumnSet.add(key);
    else      this.displayedColumnSet.delete(key);
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  constructor(private dataService: DataService ) {
    effect(() => {
      const daps = this.dataService.daps();
      this.dataSource.data = daps;
      this.dataSource._updateChangeSubscription();
    });

    effect(() => {
      const widget = this.widget();
      if (widget?.rows !== undefined) {
        const rows = widget.rows;
        this.dataSource._updateChangeSubscription();
      }
    });
    effect(() => {
    try {
      const widget = this.widget();
      console.log('📡 Widget signal changed:', widget);
      
      if (widget?.rows !== undefined) {
        this.pageSize = getMaxVisibleRows(widget.rows);
        console.log('📊 Updated pageSize to:', this.pageSize);
        const baseOptions = [5, 10, 15];
        const ps = this.pageSize;
        this.pageSizeOptions = baseOptions.includes(ps) ? baseOptions : [...baseOptions, ps];
      }
    } catch (error: unknown) {
      // Type guard for Angular errors
      if (error && typeof error === 'object' && 'code' in error && error.code === 'NG0950') {
        console.log('🔄 Hydration error caught - retrying after stabilization...');
        return;
      }
      console.error('❌ Unexpected error in widget effect:', error);
    }
  });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  applyFilter(event: Event) {
    const filter = (event.target as HTMLInputElement)
                     .value.trim().toLowerCase();
    this.dataSource.filter = filter;
  }

  linkto(id: string): string {
    return this.dataService.resolveApiUrl('dapEDIT').concat(id).concat("?editEnabled=true");
  }

  getStatusClass(status: string): string {
      return statusClassUtil(status);
  }

  createDap() {
    window.open(this.dataService.dapUI, '_blank');
  }

    clearFilter(input: HTMLInputElement) {
  input.value = '';
  this.applyFilter({ target: input } as unknown as Event);
  input.focus(); // Optional: keep focus on the input after clearing
}
}
