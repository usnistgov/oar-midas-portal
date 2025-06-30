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
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of, delay } from 'rxjs';
import { ConfigurationService } from 'oarng';
import { DataService } from '../../../services/data.service';
import { File } from '../../../models/dashboard';

@Component({
  selector: 'app-files-table',
  templateUrl: './files-table.component.html',
  styleUrls: ['./files-table.component.scss'],
})
export class FilesTableComponent implements AfterViewInit {
  private _fileList = signal<File[]>([]);
  /** Credentials as a signal */
  private authToken = signal<string | null>(null);

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
}
