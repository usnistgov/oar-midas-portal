import { Component, computed, Input, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaintenanceNoticeComponent } from '../maintenance-notice/maintenance-notice.component';
import { DataService, UserResponse } from '../../services/data.service';
import { AuthenticationService } from 'oarng';

export type MenuItem = {
  key: string;
  name: string;
  icon: string;
  link: string;
  subItems?: MenuItem[];
};

@Component({
  selector: 'app-custom-sidenav',
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.scss'
})
export class CustomSidenavComponent implements OnInit {
  /** Reactive signal representing the collapsed state */
  readonly sideNavCollapsed = signal(false);

  /** Used to control visibility of text in header (fades in/out when collapsing) */
  readonly showHeaderText = signal(false);

  /** Dynamically resize profile picture based on collapsed state */
  readonly profilePicSize = computed(() => this.sideNavCollapsed() ? '32' : '86');

  /** User details 
   * TODO: group this in an interface
  */
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
        { key: 'createDmp', name: 'Data Management Plan', icon: '', link: '' },
        { key: 'createDap', name: 'Digital Asset Publication', icon: '', link: '' },
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

  /**
   * Input setter that responds to the collapsed state from parent component.
   * Applies visual behaviors like delayed header text reveal.
   */
  @Input() set collapsed(value: boolean) {
    this.sideNavCollapsed.set(value);

    if (!value) {
      // Expand behavior: delay text appearance slightly for a smooth transition
      setTimeout(() => this.showHeaderText.set(true), 100);
    } else {
      // Collapse behavior: hide text immediately
      this.showHeaderText.set(false);
    }
  }

  constructor(
    private dialog: MatDialog,
    private dataService: DataService,
    private authsvc: AuthenticationService
  ) { }

  /** Fetch user data and apply config-based menu link overrides */
  ngOnInit(): void {
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
        this.group        = attrs['Group'];
      },
      error: err => {
        alert("Unable to determine your identity, cannot retrieve data.");
      },
    });

    this.loadMenuLinksFromConfig();
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

    const dmpUrl = cfg['dmpUI']?.value;
    const dapUrl = cfg['dapUI']?.value;

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
}
