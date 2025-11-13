import { Component, computed, Input, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaintenanceNoticeComponent } from '../maintenance-notice/maintenance-notice.component';
import { DataService, UserResponse, MaintenanceInfo } from '../../services/data.service';
import { AuthenticationService } from 'oarng';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { ThemeSelectorData, ThemeSelectorDialogComponent } from '../theme-selector-dialog/theme-selector-dialog.component';

export type MenuItem = {
  key: string;
  name: string;
  icon: string;
  link: string;
  subItems?: MenuItem[];
};

export type FamilyName = 'theme-light' | 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4';
export type Variant = 'light' | 'dark';

@Component({
  selector: 'app-custom-sidenav',
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.scss'
})
export class CustomSidenavComponent implements OnInit {
  /** Reactive signal representing the collapsed state */
  readonly sideNavCollapsed = signal<boolean>(
    JSON.parse(localStorage.getItem('sidenavCollapsed') ?? 'false')
  );

  readonly maintenanceInfo = signal<MaintenanceInfo>({
    status: 'success',
    title: 'System Status',
    content: ''
  });

  readonly sideNavWidth = computed(() => this.sideNavCollapsed() ? '64px' : '320px');

  readonly maintenanceIcon = computed(() => {
    const status = this.maintenanceInfo().status;
    
    switch (status) {
      case 'success':
        return {
          icon: 'check_circle',
          color: 'success-icon' // CSS class for green
        };
      case 'info':
        return {
          icon: 'schedule',
          color: 'warning-icon' // CSS class for orange
        };
      case 'warning':
        return {
          icon: 'warning',
          color: 'error-icon' // CSS class for red
        };
      default:
        return {
          icon: 'info',
          color: 'info-icon' // CSS class for blue
        };
    }
  });

  toggleSidenav() {
    this.sideNavCollapsed.update(value => {
      const newValue = !value;
      localStorage.setItem('sidenavCollapsed', JSON.stringify(newValue));
      // Update showHeaderText with a delay when expanding, immediately when collapsing
      if (!newValue) {
        setTimeout(() => this.showHeaderText.set(true), 100);
      } else {
        this.showHeaderText.set(false);
      }
      return newValue;
    });
  }

  /** Used to control visibility of text in header (fades in/out when collapsing) */
  readonly showHeaderText = signal(!this.sideNavCollapsed());

  /** Dynamically resize profile picture based on collapsed state */
  readonly profilePicSize = computed(() => this.sideNavCollapsed() ? '32' : '86');

  /** User details */
  userName?: string;
  userLastName?: string;
  winId?: string;
  group?: string;

  /** Menu items for the sidenav, some populated dynamically from local config */
  readonly menuItems = signal<MenuItem[]>([
    { key: 'dashboard', name: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
    { key: 'searchExport', name: 'Search and Export', icon: 'search', link: '/search' },
    {
      key: 'toolsGuide', name: 'MIDAS Tools Guide', icon: 'person', link: '#',
      subItems: [
        { key: 'userGuides', name: 'User Guides', icon: '', link: 'https://inet.nist.gov/mr/library/midas-user-guides' },
        { key: 'dmpDocs', name: 'Data Management Plans', icon: '', link: 'https://inet.nist.gov/mr/library/midas-user-guides/midas-components/data-management-plans' },
        { key: 'dapDocs', name: 'Digital Asset Publishing', icon: '', link: 'https://inet.nist.gov/mr/library/midas-user-guides/midas-components/digital-asset-publisher-dap' },
        { key: 'fileMgmt', name: 'File Management', icon: '', link: 'https://inet.nist.gov/mr/library/midas-user-guides/midas-components/file-manager' },
        { key: 'dataReview', name: 'Data Review', icon: '', link: 'https://inet.nist.gov/mr/library/midas-user-guides/midas-components/data-review-system' },
        { key: 'reports', name: 'Reports', icon: '', link: 'https://inet.nist.gov/mr/library/midas-tools/reports' },
      ]
    },
    {
      key: 'createNew', name: 'Create New…', icon: 'note_add', link: '#',
      subItems: [
        { key: 'createDmp', name: 'Data Management Plan', icon: '', link: this.dataService.dmpUI },
        { key: 'createDap', name: 'Digital Asset Publication', icon: '', link: this.dataService.dapUI },
      ]
    },
    { key: 'openAccess', name: 'Open Access INET', icon: 'open_in_new', link: '#' },
    { key: 'publicData', name: 'Public Data Portal', icon: 'public', link: 'https://data.nist.gov' },
    { key: 'userSupport', name: 'User Support', icon: 'support_agent', link: 'https://inet.nist.gov/mr/library/publishing-support-nist-publications' },
    { key: 'dataPolicy', name: 'Data Policy', icon: 'policy', link: 'https://inet.nist.gov/mr/library/midas-user-guides' },
    { key: 'devTools', name: 'Developer Tools', icon: 'build', link: 'https://inet.nist.gov/mr/library/midas-user-guides' },
    {
      key: 'chipsMetrology', name: 'CHIPS Metrology', icon: 'memory', link: '#',
      subItems: [
        { key: 'chipsGuidance', name: 'Guidance', icon: '', link: 'https://inet.nist.gov/mr/library/midas-user-guides' },
        { key: 'metisPublic', name: 'METIS Public', icon: '', link: '#' },
      ]
    }
  ]);

  // Theme and settings logic
  readonly family = signal<FamilyName>(
    (localStorage.getItem('appFamily') as FamilyName) || 'theme-light'
  );
  readonly variant = signal<Variant>(
    (localStorage.getItem('appVariant') as Variant) || 'light'
  );

  constructor(
    private dialog: MatDialog,
    private dataService: DataService,
    private authsvc: AuthenticationService
  ) { }

  /** Fetch user data and apply config-based menu link overrides */
  ngOnInit(): void {

    this.loadMaintenanceInfo();
    // Ensure showHeaderText is correct on init
    if (!this.sideNavCollapsed()) {
      setTimeout(() => this.showHeaderText.set(true), 100);
    } else {
      this.showHeaderText.set(false);
    }

    this.authsvc.getCredentials().subscribe({
      next: creds => {
        if (!creds?.userId) {
          throw new Error("Missing identity information in credentials");
        }
        console.log("Logged in as ", creds);
        const attrs = creds.userAttributes;
        this.userName     = attrs['userName'];
        this.userLastName = attrs['userLastName'];
        this.winId        = attrs['winId'];
        this.group        = attrs['userOU'];
      },
      error: err => {
        alert("Unable to determine your identity, cannot retrieve data.");
      },
    });

    this.loadMenuLinksFromConfig();
  }

  private loadMaintenanceInfo(): void {
    this.dataService.getMaintenanceInfo().subscribe(info => {
      this.maintenanceInfo.set(info);
    });
  }

  /** Updates "Create DMP/DAP" links dynamically based on `appConfig` in localStorage */
  private loadMenuLinksFromConfig(): void {
    const raw = localStorage.getItem('appConfig');
    if (!raw) return;

    let cfg: Record<string, { label: string; value: string }>;
    try {
      cfg = JSON.parse(raw);
    } catch {
      return;
    }

    const dmpUrl = this.dataService.dmpUI;
    const dapUrl = this.dataService.dapUI;

    if (!dmpUrl && !dapUrl) return;

    this.menuItems.update(items =>
      items.map(item => {
        if (item.key === 'createNew' && item.subItems) {
          return {
            ...item,
            subItems: item.subItems.map(sub => {
              if (sub.key === 'createDmp' && dmpUrl) {
                return { ...sub, link: dmpUrl };
              }
              if (sub.key === 'createDap' && dapUrl) {
                return { ...sub, link: dapUrl };
              }
              return sub;
            })
          };
        }
        return item;
      })
    );
  }

  /**
   * Opens a modal maintenance message.
   * Used when a feature is unavailable or temporarily down.
   */
  openMaintenanceNotice(): void {
    this.dialog.open(MaintenanceNoticeComponent, {
      width: '400px',
      maxWidth: '80vw',
      data: {
        message: 'Temporarily down for maintenance. Please check back soon!'
      }
    });
  }

  /** Opens the custom app settings dialog. */
  openSettings() {
    const ref = this.dialog.open(SettingsDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe(result => {
      if (result?.refresh) {
        window.location.reload();
      }
    });
  }

  /** Opens the theme selector dialog. */
  openThemeSelector() {
    const dialogRef = this.dialog.open(ThemeSelectorDialogComponent, {
      data: { family: this.family(), variant: this.variant() }
    });

    dialogRef.afterClosed().subscribe((res: ThemeSelectorData | undefined) => {
      if (res) {
        this.family.set(res.family);
        this.variant.set(res.variant);
        localStorage.setItem('appFamily', res.family);
        localStorage.setItem('appVariant', res.variant);
        // Optionally update document classes here if needed
        const docEl = document.documentElement;
        docEl.classList.remove('theme-light', 'theme-1', 'theme-2', 'theme-3', 'theme-4', 'light', 'dark');
        docEl.classList.add(res.family, res.variant);
      }
    });
  }
}