import {
  Component,
  AfterViewInit,
  signal,
  effect,
  computed,
  inject,
  ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { DataService } from '../../../services/data.service';
import { File } from '../../../models/dashboard';
import { Widget } from '../../../models/dashboard';
import { getMaxVisibleRows } from '../table-utils';
import { input } from '@angular/core';

@Component({
  selector: 'app-files-table',
  templateUrl: './files-table.component.html',
  styleUrls: ['./files-table.component.scss'],
})
export class FilesTableComponent implements AfterViewInit {
  private _fileList = signal<File[]>([]);
  /** Credentials as a signal */
  private authToken = signal<string | null>(null);
  widget = input.required<Widget>();

  /** Fallback static data */
  private fallback: File[] = [
    { id: 'testId1', name: 'Report.pdf', usage: 'Public', fileCount: 1, modifiedDate: new Date('2025-04-12'), location: '/files/report.pdf' },
    { id: 'testId2', name: 'Images.zip', usage: 'Private', fileCount: 24, modifiedDate: new Date('2025-04-14'), location: '/files/images.zip' },
    { id: 'testId3', name: 'Results.csv', usage: 'Public', fileCount: 1, modifiedDate: new Date('2025-04-15'), location: '/files/results.csv' }
  ];


  /** Raw API data + processed files list */
  private rawData = signal<File[]>([]);
  public files = signal<File[]>([]);
  public isLoading = signal(false);
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // master list of columns
  allColumns = [
    { key: 'name',        label: 'Name' },
    { key: 'usage',       label: 'Usage' },
    { key: 'fileCount',  label: 'File Count' },
    { key: 'modifiedDate', label: 'Last Modified' }
  ];

  // keys in order
  readonly allColumnKeys = this.allColumns.map(c => c.key);

  // track which columns are visible
  displayedColumnSet = new Set<string>(this.allColumnKeys);

  // expose to template
  get displayedColumns(): string[] {
    return this.allColumnKeys.filter(k => this.displayedColumnSet.has(k));
  }

  // add or remove a column
  toggleColumn(key: string, on: boolean) {
    if (on) this.displayedColumnSet.add(key);
    else    this.displayedColumnSet.delete(key);
  }


  /** Table wiring */
  public dataSource = new MatTableDataSource<File>([]);
  public length = computed(() => this.dataService.files().length);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  
  constructor(private dataService: DataService ) {
    effect(() => {
      const files = this.dataService.files();
      this.dataSource.data = files;
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
      
      console.log('📡 Widget signal changed:', widget);
      
      if (widget?.rows !== undefined) {
        this.pageSize = getMaxVisibleRows(widget.rows);
        console.log('📊 Updated pageSize to:', this.pageSize);
        const baseOptions = [5, 10, 15];
        const ps = this.pageSize;
        this.pageSizeOptions = baseOptions.includes(ps) ? baseOptions : [...baseOptions, ps];
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
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /** Trigger built-in filter */
  applyFilter(event: Event) {
    const filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filter;
  }


  /** Link builder */
  linkto(id: string) {
    return this.dataService.resolveApiUrl('dapEDIT').concat(id).concat("?editEnabled=true");
  }

  createFile() {
    window.open(this.dataService.nextcloudUI, '_blank');
  }

  clearFilter(input: HTMLInputElement) {
  input.value = '';
  this.applyFilter({ target: input } as unknown as Event);
  input.focus(); // Optional: keep focus on the input after clearing
}
}
