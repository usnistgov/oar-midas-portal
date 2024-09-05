import { Component } from '@angular/core';
import { DynamicDialogRef,DynamicDialogConfig } from 'primeng/dynamicdialog';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'oarng';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent {
    textContent: SafeHtml = '';
    placeholder: SafeHtml = '';
    infoURL: string ;
  constructor(private cfgsvc: ConfigurationService,public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,private http: HttpClient,private sanitizer: DomSanitizer) {
    this.config.dismissableMask = true;
    this.placeholder = this.sanitizer.bypassSecurityTrustHtml(`
         FROM placeholder
        <p>Please be advised that the maintenance of this website occurs:</p>
        <ul>
          <li><strong>Every Sunday from 9 PM to 10 PM</strong></li>
          <li><strong>For a full day every two weeks</strong></li>
        </ul>
        <p>
          For any inquiries, please contact <strong>gretchen.greene@nist.gov</strong>.
        </p>
      `);
    
  }

  ngOnInit() {
    this.infoURL = this.cfgsvc.getConfig()['infoURL'];
    this.loadTextContent(this.infoURL);
  }

  loadTextContent(url: string) {
    this.http.get(url, { responseType: 'text' }).subscribe(
      data => {
        this.textContent = this.sanitizer.bypassSecurityTrustHtml(data);
      },
      error => {
        console.error('Error loading text content', error);
        this.textContent = this.placeholder;
      }
    );
  }

  close() {
    this.ref.close('Some data');
  }
}