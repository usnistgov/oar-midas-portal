import { Component, computed, ElementRef, inject, signal, viewChild,effect } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { wrapGrid } from 'animate-css-grid';
import { finalize } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { Dmp } from '../search/search.component';
import { DataService } from '../../services/data.service';
import { CredentialsService } from '../../services/credentials.service';
import { ConfigurationService } from 'oarng';
import { WebSocketService } from '../../services/websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  /** Injected dashboard service for managing widget state and data fetching */
  readonly dataService = inject(DataService);
  readonly dashboardService = inject(DashboardService);
  readonly configService = inject(ConfigurationService)
  private wsService = inject(WebSocketService);
  readonly snackBar = inject(MatSnackBar);
  readonly credsService = inject(CredentialsService);

  /** Reference to the widgets grid container (for animation binding) */
  readonly dashboard = viewChild.required<ElementRef>('widgetsContainer');

  /** Sidebar visibility toggle */
  readonly isSidebarVisible = signal(false);

  /** Indicates loading state for filters/DMPs */
  readonly isLoading = signal(false);

  /** Computed filter values from DMP data */
  readonly names = computed(() =>
    Array.from(new Set(this.dataService.dmps().map(d => d.name)))
  );
  readonly owners = computed(() =>
    Array.from(new Set(this.dataService.dmps().map(d => d.owner)))
  );
  readonly contacts = computed(() =>
    Array.from(new Set(this.dataService.dmps().map(d => d.primaryContact)))
  );

  /** Selected filter values (bound to UI controls) */
  selectedName?: string;
  selectedOwner?: string;
  selectedContact?: string;

  /** Date filter settings */
  dateFilterType: 'exact' | 'before' | 'after' | 'between' = 'exact';
  exactDate?: Date;
  beforeDate?: Date;
  afterDate?: Date;
  startDate?: Date;
  endDate?: Date;

  constructor() {
}


  

  /**
   * Lifecycle hook — animate widgets grid and load DMP data.
   */
  ngOnInit(): void {
  this.isLoading.set(true);
  const waitForToken = () => {
    const token = this.dataService['credsService'].token();
    if (token) {
      this.dataService.loadReviews()
      this.dataService.loadAll().subscribe({
        next: () => {
          this.isLoading.set(false);
          wrapGrid(this.dashboard().nativeElement, { duration: 300 });
        },
        error: () => {
          this.isLoading.set(false);
          this.snackBar.open('Failed to load dashboard data.', 'Dismiss', { duration: 3000 });
        }
      });
    } else {
      setTimeout(waitForToken, 100); // Try again in 100ms
    }
  };

  waitForToken();
}

ngAfterViewInit(): void {
    this.updateWidgetSizes();

  window.addEventListener('resize', () => {
    this.updateWidgetSizes();
  });
}

  /**
   * Handles drag-and-drop widget rearrangement.
   */
  drop(event: CdkDragDrop<number, any>): void {
    const { previousContainer, container } = event;
    this.dashboardService.updateWidgetPosition(previousContainer.data, container.data);
  }

  getGridColumnCount(): number {
  const container = this.dashboard().nativeElement as HTMLElement;
  const minColWidth = 200;
  const gap = 16;
  const containerWidth = container.offsetWidth;

  // Try to fit as many columns as possible
  let columns = Math.floor((containerWidth + gap) / (minColWidth + gap));

  // Check if the last column actually fits
  while (
    columns > 1 &&
    (columns * minColWidth + (columns - 1) * gap) > containerWidth
  ) {
    columns--;
  }

  return Math.max(1, columns);
}

  updateWidgetSizes(): void {
    const colCount = this.getGridColumnCount();
    const colValue = colCount < 4 ? colCount : Math.floor(colCount / 2);
    // Example: set every widget to span 1 column and 1 row, or use colCount for full width
    const updated = this.dashboardService.addedWidgets().map(w => ({
      ...w,
      columns: Math.max(w.columns ?? 1, colValue),
      rows: w.rows ?? 1 // you can adjust this logic as needed
    }));
    this.dashboardService.addedWidgets.set(updated);
  }

  /**
   * Toggles the filter sidebar and prevents background scroll when open.
   */
  toggleSidebar(): void {
    const open = !this.isSidebarVisible();
    this.isSidebarVisible.set(open);

    document.documentElement.classList.toggle('no-scroll', open);
    document.body.classList.toggle('no-scroll', open);
  }

  /**
   * Resets all date inputs when filter type changes.
   */
  onDateFilterChange(): void {
    this.exactDate = undefined;
    this.beforeDate = undefined;
    this.afterDate = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
  }

  /**
   * Clears all filters and simulates loading (used by "Clear Filters" button).
   * TODO: revisit logic here
   */
  clearFilters(): void {
    this.isLoading.set(true);

    // Reset UI-bound filters
    this.selectedName = undefined;
    this.selectedOwner = undefined;
    this.selectedContact = undefined;
    this.dateFilterType = 'exact';
    this.onDateFilterChange();

    // Simulated debounce/load delay
    // TODO: clean this up
    setTimeout(() => this.isLoading.set(false), 800);
  }

}
