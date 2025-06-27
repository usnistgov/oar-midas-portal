import { Component, inject} from '@angular/core';
import { DataService } from '../../services/data.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-maintenance-notice',
  templateUrl: './maintenance-notice.component.html',
  styleUrl: './maintenance-notice.component.scss'
})
export class MaintenanceNoticeComponent {
  readonly dataService = inject(DataService);
  readonly sanitizer = inject(DomSanitizer);

  infoHtml: SafeHtml = '';

  ngOnInit(): void {
    this.dataService.getInfoText().subscribe(html => {
      this.infoHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    });
  }

  

}
