import { Component, ViewChild, computed, effect, signal, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { ThemeSelectorData, ThemeSelectorDialogComponent } from './components/theme-selector-dialog/theme-selector-dialog.component';
import { DashboardService } from './services/dashboard.service';
import { DataService } from './services/data.service';
import { WebSocketService } from './services/websocket.service';
import { AuthenticationService } from 'oarng';
import { CredentialsService } from './services/credentials.service';

/**
 * Represents available theme families for the app.
 */
export type FamilyName = 'theme-light' | 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4';

/**
 * Represents theme variants: light or dark.
 */
export type Variant = 'light' | 'dark';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  /** Application title (not currently in use) */
  readonly title = 'Midas Portal';

  /** URL fallback to a local JSON file in case external API calls fail */
  private readonly fallbackUrl = '/assets/dmp.json';

  /**
   * Signal holding whether the side nav is collapsed.
   * Initial value is retrieved from localStorage for persistence.
   */
  readonly collapsed = signal<boolean>(
    JSON.parse(localStorage.getItem('sidenavCollapsed') ?? 'false')
  );

  /**
   * Computed signal representing the dynamic width of the sidenav based on collapsed state.
   */
  readonly sideNavWidth = computed(() => this.collapsed() ? '64px' : '320px');

  /**
   * Signal for the selected theme family (used for applying Material themes).
   * Persisted to localStorage and applied to the document root.
   */
  readonly family = signal<FamilyName>(
    (localStorage.getItem('appFamily') as FamilyName) || 'theme-light'
  );

  /**
   * Signal for the selected theme variant (light or dark).
   * Persisted to localStorage and applied to the document root.
   */
  readonly variant = signal<Variant>(
    (localStorage.getItem('appVariant') as Variant) || 'light'
  );

  /** Reference to the MatSidenav element in the template */
  @ViewChild('sidenav') sidenav!: MatSidenav;

  /** Reason for closing the sidenav (used for animation or message tracking) */
  reason = '';

  /** Timer reference for sidenav auto-expand on hover,
  used to delay the automatic expansion of the sidenav when a user hovers over it. */
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  // Injected services
  private wsService = inject(WebSocketService);
  private snackBar = inject(MatSnackBar);

  constructor(
    public dashboardService: DashboardService,
    public dataService: DataService,
    private dialog: MatDialog,
    private authsvc: AuthenticationService,
    private credsService: CredentialsService
  ) {
    /**
     * Whenever family or variant changes:
     * - persist new values to localStorage
     * - update document classes to apply themes dynamically
     */
    effect(() => {
      localStorage.setItem('appFamily', this.family());
      localStorage.setItem('appVariant', this.variant());

      // get the the entire <html> element, and apply classes
      const docEl = document.documentElement;
      docEl.classList.remove('theme-light', 'theme-1', 'theme-2', 'theme-3', 'theme-4', 'light', 'dark');
      docEl.classList.add(this.family(), this.variant());
    });
  }

  ngOnInit(): void {
    // Initialize authentication and credentials
    this.initializeAuthentication();
    
    // Initialize WebSocket connection
    this.initializeWebSocket();
  }

  /**
   * Initialize authentication and set up credentials
   */
  private initializeAuthentication(): void {
    this.authsvc.getCredentials().subscribe({
      next: creds => {
        if (creds?.token) {
          this.credsService.setCreds({
            userId: creds?.userId,
            userAttributes: creds?.userAttributes,
            token: creds?.token
          });
        } else {
          alert("Unable to determine your identity, cannot retrieve data.");
        }
      },
      error: err => {
        alert("Unable to determine your identity, cannot retrieve data.");
      },
    });
  }

  /**
   * Initialize WebSocket connection and handle incoming messages
   */
  private initializeWebSocket(): void {
    const waitForToken = () => {
      const token = this.credsService.token();
      if (token) {
        // Initialize WebSocket connection
        const wsUrl = this.dataService.resolveApiUrl('websocket_dbio');
        this.wsService.connect(wsUrl);

        // Subscribe to WebSocket messages
        this.wsService.messages$().subscribe(msg => {
          const displayMsg = this.wsService.toDisplay(msg);
          this.snackBar.open(displayMsg, 'Dismiss', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });

          // Refresh data when records are updated
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
      } else {
        setTimeout(waitForToken, 100); // Try again in 100ms
      }
    };

    waitForToken();
  }

  /** Sets a new theme family */
  setFamily(f: FamilyName) {
    this.family.set(f);
  }

  /** Sets a new theme variant */
  setVariant(v: Variant) {
    this.variant.set(v);
  }

  /**
   * Opens the fallback JSON file in a new browser tab.
   * 
   * This was primarily used during development when external services (dbio API and backend)
   * were unavailable, to allow for testing and load local data instead.
   * TODO: should be removed.
   */
  openFallback() {
    window.open(this.fallbackUrl, '_blank');
  }

  /**
   * Opens the theme selector dialog.
   * On selection, updates both theme family and variant.
   */
  openThemeSelector() {
    const dialogRef = this.dialog.open(ThemeSelectorDialogComponent, {
      data: { family: this.family(), variant: this.variant() }
    });

    dialogRef.afterClosed().subscribe((res: ThemeSelectorData | undefined) => {
      if (res) {
        this.family.set(res.family);
        this.variant.set(res.variant);
      }
    });
  }

  /**
   * Toggles the collapsed state of the sidenav.
   * Automatically updates the signal and persists the new state in localStorage.
   */
  toggleSidenav() {
    this.collapsed.update(value => {
      const newValue = !value;
      localStorage.setItem('sidenavCollapsed', JSON.stringify(newValue));
      return newValue;
    });
  }

  /** Closes the sidenav with a provided reason */
  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }

  /**
   * Callback for sidenav open/close event.
   * Stores the inverse of the open state into the collapsed signal and localStorage.
   */
  onOpenedChange(opened: boolean) {
    const isCollapsed = !opened;
    this.collapsed.set(isCollapsed);
    localStorage.setItem('sidenavCollapsed', JSON.stringify(isCollapsed));
  }

  /**
   * When the mouse hovers over the collapsed sidenav:
   * triggers a short delay before auto-expanding it.
   */
  onMouseEnter() {
    clearTimeout(this.hoverTimeout!);
    this.hoverTimeout = setTimeout(() => {
      this.collapsed.set(false);
      localStorage.setItem('sidenavCollapsed', 'false');
    }, 300);
  }

  /** Clears any hover-triggered auto-expand behavior on mouse leave */
  onMouseLeave() {
    clearTimeout(this.hoverTimeout!);
  }

  /**
   * Opens the custom app settings dialog.
   * 
   * This was mainly used during development to configure different options manually (dbio API urls).
   * It can be removed or repurposed for real settings if needed in production.
   * If the dialog result sends a refresh flag, the page will be reloaded.
   */
  openSettings() {
    const ref = this.dialog.open(SettingsDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe(result => {
      if (result?.refresh) {
        window.location.reload();
      }
    });
  }
}