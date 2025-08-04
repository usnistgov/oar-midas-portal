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
import { of, delay, finalize } from 'rxjs';
import { catchError }          from 'rxjs/operators';
import { DashboardService }   from '../../../services/dashboard.service';
import { DataService } from '../../../services/data.service';
import { Dap } from '../../../models/dashboard';
import { getStatusClass as statusClassUtil } from 'src/app/shared/table-utils';

@Component({
  selector: 'app-dap-table',
  templateUrl: './dap-table.component.html',
  styleUrls: ['./dap-table.component.scss']
})
export class DapTableComponent implements  AfterViewInit {
  dataSource       = new MatTableDataSource<Dap>([]);
  length           = computed(() => this.dataService.daps().length);

  /** Loading state for overlay */
  isLoading = signal(false);

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
    });
  }

  /*
  ngOnInit() {
    this.isLoading.set(true);
    this.dataService.getDaps().pipe(
      delay(300),               // ensure spinner is visible briefly
      catchError(() => of([])), // swallow errors
      finalize(() => this.isLoading.set(false))
    )
    .subscribe(list => this._dapList.set(list));
  }
*/
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
}
