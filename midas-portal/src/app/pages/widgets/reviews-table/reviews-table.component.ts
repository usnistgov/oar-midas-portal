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
import { MatSort, Sort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of, delay } from 'rxjs';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../../services/credentials.service';
import { DataService } from '../../../services/data.service';
import { Review }  from '../../../models/dashboard';

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

  /**
   * Fetch reviews from API, fallback to empty
   */
  /* private loadReviews(token: string, uid: string) {
    this.isLoading = true;

    let base = (this.cfgSvc.getConfig()['NPSAPI'] as string) || '';
    base = base.endsWith('/') ? base : base + '/';
    const url = `${base}${uid}`;

    this.http.get<Review[]>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(arr => console.log(`Loaded ${arr.length} reviews`)),
      catchError(err => {
        console.error('Error fetching reviews:', err);
        return of<Review[]>([]);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(rows => this.reviews.set(rows));
  } */

  applyFilter(event: Event) {
    const filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filter;
  }

  linkto(id: string): string {
    return this.dataService.resolveApiUrl('NPSAPI').concat('Dataset/DataSetDetails?id=').concat(id);
  }
}
