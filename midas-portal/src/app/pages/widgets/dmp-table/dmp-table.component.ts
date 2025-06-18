import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  signal,
  computed,
  effect
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, delay, finalize, of } from 'rxjs';
import { DataService } from '../../../services/data.service';

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

  length = computed(() => this.dataService.dmps().length);

  isLoading = signal(false);

  allColumns = [
    { key: 'name',           label: 'Name' },
    { key: 'owner',          label: 'Owner' },
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
    else     this.displayedColumnSet.delete(key);
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService) {
    // keep table data in sync with the signal
    effect(() => {
      const dmps = this.dataService.dmps();
      this.dataSource.data = dmps;
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

  /** open the create‐new page */
  createDmp() {
    // opens URL from localStorage (via service getter)
    window.open(this.dataService.dmpUI, '_blank');
  }
}
