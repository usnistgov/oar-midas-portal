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
      this.dataService.loadAll().subscribe({
        next: () => {
          this.isLoading.set(false);
          const wsUrl = this.dataService.resolveApiUrl('websocket_dbio');
          wrapGrid(this.dashboard().nativeElement, { duration: 300 });
          this.wsService.connect(wsUrl);

          this.wsService.messages$().subscribe(msg => {
            const displayMsg = this.wsService.toDisplay(msg);
            this.snackBar.open(displayMsg, 'Dismiss', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            // Optionally refresh data:
            if (this.wsService.record_type(msg) === 'dmp') {
              this.dataService.getDmps().subscribe(dmps => {
                this.dataService.setDmps(dmps);
              });
            } else if (this.wsService.record_type(msg) === 'dap') {
              this.dataService.getDaps().subscribe(daps => {
                this.dataService.setDaps(daps);
              });
              this.dataService.getFiles().subscribe(files => {
                this.dataService.setFiles(files);
              });
            }
          });
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

  /**
   * Handles drag-and-drop widget rearrangement.
   */
  drop(event: CdkDragDrop<number, any>): void {
    const { previousContainer, container } = event;
    this.dashboardService.updateWidgetPosition(previousContainer.data, container.data);
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
