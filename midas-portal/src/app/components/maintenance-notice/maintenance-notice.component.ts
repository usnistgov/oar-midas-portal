import { Component, inject, computed, signal } from '@angular/core';
import { DataService, MaintenanceInfo } from '../../services/data.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface NoticeConfig {
  icon: string;
  color: string;
  title: string;
}

@Component({
  selector: 'app-maintenance-notice',
  templateUrl: './maintenance-notice.component.html',
  styleUrl: './maintenance-notice.component.scss'
})
export class MaintenanceNoticeComponent {
  readonly dataService = inject(DataService);
  readonly sanitizer = inject(DomSanitizer);

  // Signals for reactive updates
  public maintenanceInfo = signal<MaintenanceInfo>({
    status: 'success',
    title: 'System Status',
    content: ''
  });

  // Computed properties for dynamic styling
  noticeConfig = computed((): NoticeConfig => {
    const status = this.maintenanceInfo().status;
    
    switch (status) {
      case 'success':
        return {
          icon: 'check_circle',
          color: 'success', // Green
          title: 'All Systems Operational'
        };
      case 'info':
        return {
          icon: 'schedule',
          color: 'warning', // Orange
          title: 'Maintenance Scheduled'
        };
      case 'warning':
        return {
          icon: 'warning',
          color: 'error', // Red
          title: 'Under Maintenance'
        };
      default:
        return {
          icon: 'info',
          color: 'primary',
          title: 'System Notice'
        };
    }
  });

  infoHtml = computed((): SafeHtml => {
    const content = this.maintenanceInfo().content;
    return this.sanitizer.bypassSecurityTrustHtml(content);
  });

  ngOnInit(): void {
    this.dataService.getMaintenanceInfo().subscribe(info => {
      this.maintenanceInfo.set(info);
    });
  }
}