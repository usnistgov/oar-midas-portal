import {
  Component,
  AfterViewInit,
  ViewChild,
  signal,
  computed,
  effect,
  inject
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of, delay } from 'rxjs';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../../services/credentials.service';
import { DataService } from '../../../services/data.service';
import { Review }  from '../../../models/dashboard';
import { Widget } from '../../../models/dashboard';
import { getMaxVisibleRows } from '../table-utils';
import { input } from '@angular/core';

const fakeReviews: Review[] = [
  {
    id: 'FB-1001',
    title: 'Review 2',
    submitterName: 'Alice Example',
    currentReviewer: 'Bob Reviewer',
    currentReviewStep: 'Pending'
  },
  {
    id: 'FB-1002',
    title: 'Review 2',
    submitterName: 'Charlie Example',
    currentReviewer: 'Dana Critique',
    currentReviewStep: 'Approved'
  }
];

@Component({
  selector: 'app-review-table',
  templateUrl: './reviews-table.component.html',
  styleUrls: ['./reviews-table.component.scss'],
})
export class ReviewsTableComponent implements AfterViewInit {
 /** Reactive table state */
  private _reviewList = signal<Review[]>([]);
  public dataSource = new MatTableDataSource<Review>([]);
  public length = computed(() => this._reviewList().length);
  widget = input.required<Widget>();
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  
  /** Loading state for overlay */
  isLoading = signal(false);
  
  // master list of columns
  allColumns = [
    { key: 'title',             label: 'Title' },
    { key: 'submitterName',     label: 'Submitter Name' },
    { key: 'currentReviewer',   label: 'Current Reviewer' },
    { key: 'currentReviewStep', label: 'Review Step' }
  ];

  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumnSet = new Set<string>(this.allColumnKeys);

  get displayedColumns(): string[] {
    return this.allColumnKeys.filter(k => this.displayedColumnSet.has(k));
  }

  toggleColumn(key: string, on: boolean) {
    if (on) this.displayedColumnSet.add(key);
    else    this.displayedColumnSet.delete(key);
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private http = inject(HttpClient);
  private cfgSvc = inject(ConfigurationService);
  private credsService = inject(CredentialsService);

  /* constructor() {
    // keep table in sync
    effect(() => this.dataSource.data = this.reviews());

    // watch token and userId to trigger fetch
    effect(() => {
      const token = this.credsService.token();
      const uid = this.credsService.userId();
      if (token && uid) {
        this.loadReviews(token, uid);
      }
    });
  } */

    constructor(private dataService: DataService ) {
        effect(() => {
          this.dataSource.data = this._reviewList();
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

  ngOnInit() {
      this.isLoading.set(false);
      this.dataService.getReviews().pipe(
        delay(300),               // ensure spinner is visible briefly
        catchError(() => of([])), // swallow errors
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(list => this._reviewList.set(list));
    }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  applyFilter(event: Event) {
    const filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filter;
  }

  

  linkto(id: string): string {
    const userId = this.credsService.userId?.() || this.credsService.userId ; // adapt to your service
    return this.dataService.resolveApiUrl('NPSAPI')+userId+'Dataset/DataSetDetails?id='.concat(id);
  }

    clearFilter(input: HTMLInputElement) {
  input.value = '';
  this.applyFilter({ target: input } as unknown as Event);
  input.focus(); // Optional: keep focus on the input after clearing
}
}
